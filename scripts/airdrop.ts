#!/usr/bin/env ts-node
/**
 * DOPE airdrop utility (SPL token or SOL faucet for devnets)
 * - Dry-run by default (DRY_RUN=true). Use --execute --yes to actually send.
 * - Supports fixed amount per recipient (--amount) or percentage of admin balance distributed across all recipients (--percent).
 * - Creates ATAs as needed. Uses mintTo when admin is mint authority or MINT_AUTH_SECRET is provided; otherwise transfers from admin ATA.
 * - Outputs CSV receipts.
 *
 * Env (suggested in .env or shell):
 *   RPC_URL=...                 # RPC endpoint (defaults to devnet if not set)
 *   ADMIN_SECRET_KEY=...        # base58-encoded secret key
 *   MINT_ADDRESS=...            # SPL mint address (optional if using --sol)
 *   MINT_AUTH_SECRET=...        # base58-encoded mint authority (optional). If present/valid, mints directly to recipients
 *   DRY_RUN=true                # default safety
 */

import fs from 'fs';
import path from 'path';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transferChecked,
} from '@solana/spl-token';
import bs58 from 'bs58';

type Args = {
  addressesPath?: string;
  amount?: number; // tokens per recipient
  percent?: number; // percent of admin balance distributed equally across recipients
  rpc?: string;
  mint?: string;
  sol?: boolean;
  execute?: boolean;
  yes?: boolean;
  concurrency?: number;
  csv?: string;
  keypair?: string; // path to keypair json (optional alternative)
  skipInvalid?: boolean;
};

function parseArgs(): Args {
  const a = process.argv.slice(2);
  const out: Args = {};
  for (let i = 0; i < a.length; i++) {
    const k = a[i];
    const next = () => a[++i];
    switch (k) {
      case '--addresses':
      case '--addressesPath': out.addressesPath = next(); break;
      case '--amount': out.amount = Number(next()); break;
      case '--percent': out.percent = Number(next()); break;
      case '--rpc': out.rpc = next(); break;
      case '--mint': out.mint = next(); break;
      case '--sol': out.sol = true; break;
      case '--execute': out.execute = true; break;
      case '--yes': out.yes = true; break;
      case '--concurrency': out.concurrency = Number(next()); break;
      case '--csv': out.csv = next(); break;
      case '--keypair': out.keypair = next(); break;
      case '--skipInvalid': out.skipInvalid = true; break;
      default:
        // ignore unknowns
        break;
    }
  }
  return out;
}

function readAddresses(p: string): string[] {
  const raw = fs.readFileSync(p, 'utf8');
  const list = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  // remove '#'-commented lines
  return list.filter(x => !x.startsWith('#'));
}

async function confirmPrompt(summary: string, nonInteractive: boolean): Promise<boolean> {
  if (nonInteractive) return true;
  process.stdout.write(`\n${summary}\n\nType 'yes' to proceed: `);
  return await new Promise<boolean>((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (d) => {
      const ans = String(d || '').trim().toLowerCase();
      resolve(ans === 'yes');
    });
  });
}

function loadKeypairFromEnvOrPath(keypairPath?: string): Keypair {
  if (keypairPath) {
    const abs = path.resolve(process.cwd(), keypairPath);
    const raw = JSON.parse(fs.readFileSync(abs, 'utf8')) as number[];
    return Keypair.fromSecretKey(new Uint8Array(raw));
  }
  const b58 = process.env.ADMIN_SECRET_KEY || '';
  if (!b58) throw new Error('ADMIN_SECRET_KEY not set and no --keypair provided');
  return Keypair.fromSecretKey(bs58.decode(b58));
}

function pow10BigInt(decimals: number): bigint {
  let r = BigInt(1);
  for (let i = 0; i < decimals; i++) r = r * BigInt(10);
  return r;
}

function fmt(n: bigint, decimals: number): string {
  const factor = pow10BigInt(decimals);
  const whole = n / factor;
  const frac = n % factor;
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

async function main() {
  const args = parseArgs();
  const DRY_RUN = String(process.env.DRY_RUN || 'true').toLowerCase() !== 'false' && !args.execute;
  const rpc = args.rpc || process.env.RPC_URL || clusterApiUrl('devnet');
  const conn = new Connection(rpc, 'confirmed');

  if (!args.addressesPath) throw new Error('Use --addresses <file>');
  const recipients = readAddresses(args.addressesPath);
  if (recipients.length === 0) throw new Error('No recipient addresses found');
  // Validate base58 public keys upfront with helpful errors
  const valid: string[] = [];
  const invalid: { line: number; value: string; reason: string }[] = [];
  recipients.forEach((v, i) => {
    try { new PublicKey(v); valid.push(v); } catch (e: any) { invalid.push({ line: i + 1, value: v, reason: e?.message || 'invalid pubkey' }); }
  });
  if (invalid.length > 0 && !args.skipInvalid) {
    const msg = invalid.map(x => `line ${x.line}: ${x.value} — ${x.reason}`).join('\n');
    throw new Error(`Invalid recipient addresses detected. Fix the file or pass --skipInvalid to ignore invalid lines.\n${msg}\nHint: Solana base58 excludes 0 (zero), O (capital o), I (capital i), and l (lowercase L).`);
  }
  const recipientsChecked = invalid.length > 0 ? valid : recipients;
  if (recipientsChecked.length === 0) throw new Error('No valid recipient addresses after filtering');

  const admin = loadKeypairFromEnvOrPath(args.keypair);

  if (args.sol) {
    // Devnet/testnet faucet path (SOL)
    const lamports = BigInt(Math.round((args.amount || 0) * LAMPORTS_PER_SOL));
    if (lamports <= BigInt(0)) throw new Error('Provide --amount for SOL airdrop');
    const summary = `SOL Airdrop\nRecipients: ${recipients.length}\nPer recipient: ${(Number(lamports)/LAMPORTS_PER_SOL).toFixed(6)} SOL\nNetwork: ${rpc}`;
    const ok = await confirmPrompt(summary, args.yes || !process.stdout.isTTY || !process.stdin.isTTY || !DRY_RUN);
    if (!ok) { console.log('Aborted'); process.exit(1); }
    const csv: string[] = ['address,signature'];
    for (const r of recipients) {
      if (DRY_RUN) { csv.push(`${r},DRY_RUN`); continue; }
      const sig = await conn.requestAirdrop(new PublicKey(r), Number(lamports));
      csv.push(`${r},${sig}`);
    }
    fs.writeFileSync(args.csv || 'airdrop_receipts.csv', csv.join('\n'));
    console.log('Done. CSV:', args.csv || 'airdrop_receipts.csv');
    return;
  }

  const mintAddr = new PublicKey(args.mint || process.env.MINT_ADDRESS || (() => { throw new Error('Provide --mint or set MINT_ADDRESS'); })());
  const mintInfo = await getMint(conn, mintAddr);
  const decimals = mintInfo.decimals;

  // Admin token balance
  const adminAta = await getOrCreateAssociatedTokenAccount(conn, admin, mintAddr, admin.publicKey);
  const adminBalUnits = BigInt(adminAta.amount.toString());

  // Determine distribution amount
  let perRecipientUnits: bigint;
  if (args.amount && args.amount > 0) {
    perRecipientUnits = BigInt(Math.round(args.amount * Math.pow(10, decimals)));
  } else if (args.percent && args.percent > 0) {
    const totalShare = (adminBalUnits * BigInt(Math.round(args.percent * 100))) / BigInt(100 * 100);
    perRecipientUnits = totalShare / BigInt(recipients.length);
  } else {
    throw new Error('Provide --amount <tokens> or --percent <pct>');
  }
  if (perRecipientUnits <= BigInt(0)) throw new Error('Per-recipient amount rounds to zero; increase amount or decimals');
  const totalUnits = perRecipientUnits * BigInt(recipients.length);

  // Mint authority
  let mintAuthority: Keypair | null = null;
  const mintAuthB58 = process.env.MINT_AUTH_SECRET || '';
  if (mintAuthB58) {
    try { mintAuthority = Keypair.fromSecretKey(bs58.decode(mintAuthB58)); } catch { throw new Error('Invalid MINT_AUTH_SECRET'); }
  }

  const canMint = mintAuthority?.publicKey?.equals(mintInfo.mintAuthority ?? PublicKey.default) || false;
  if (!canMint && totalUnits > adminBalUnits) {
    throw new Error(`Insufficient admin balance. Need ${fmt(totalUnits, decimals)} but have ${fmt(adminBalUnits, decimals)}.`);
  }

  const summary = [
    `Token Airdrop (SPL)`,
    `Mint: ${mintAddr.toBase58()} (decimals=${decimals})`,
    `Recipients: ${recipients.length}`,
    `Per recipient: ${fmt(perRecipientUnits, decimals)}`,
    `Total: ${fmt(totalUnits, decimals)}`,
    `Admin balance: ${fmt(adminBalUnits, decimals)} ${canMint ? '(mint authority available)' : ''}`,
    `Network: ${rpc}`,
    `Mode: ${DRY_RUN ? 'DRY_RUN' : 'EXECUTE'}`,
  ].join('\n');

  const ok = await confirmPrompt(summary, args.yes || !process.stdout.isTTY || !process.stdin.isTTY || !DRY_RUN);
  if (!ok) { console.log('Aborted'); process.exit(1); }

  const csv: string[] = ['address,ata,amount,signature,mode'];

  // Concurrency control
  const concurrency = Math.max(1, Math.min(8, args.concurrency ?? 3));
  let idx = 0;
  const tasks = recipientsChecked.map((addr) => async () => {
    const owner = new PublicKey(addr);
    // Ensure ATA
    const ata = await getOrCreateAssociatedTokenAccount(conn, admin, mintAddr, owner);
    if (DRY_RUN) { csv.push(`${addr},${ata.address.toBase58()},${fmt(perRecipientUnits, decimals)},DRY_RUN,DRY_RUN`); return; }
    let sig = '';
    if (canMint && mintAuthority) {
      sig = await mintTo(conn, admin, mintAddr, ata.address, mintAuthority, perRecipientUnits);
    } else {
      sig = await transferChecked(conn, admin, adminAta.address, mintAddr, ata.address, admin, perRecipientUnits, decimals);
    }
    csv.push(`${addr},${ata.address.toBase58()},${fmt(perRecipientUnits, decimals)},${sig},EXECUTE`);
  });

  // Simple queue
  async function runQueue() {
    const running: Promise<void>[] = [];
    for (const t of tasks) {
      const p = t().catch((e) => { console.error('Error sending to recipient:', e?.message || e); });
      running.push(p as unknown as Promise<void>);
      if (running.length >= concurrency) {
        await Promise.race(running).catch(()=>{});
        // remove settled
        for (let i = running.length - 1; i >= 0; i--) {
          if ((running[i] as any).settled) running.splice(i, 1);
        }
      }
    }
    await Promise.allSettled(running);
  }

  await runQueue();
  fs.writeFileSync(args.csv || 'airdrop_receipts.csv', csv.join('\n'));
  console.log('Done. CSV:', args.csv || 'airdrop_receipts.csv');
}

main().catch((e) => { console.error(e?.message || e); process.exit(1); });
