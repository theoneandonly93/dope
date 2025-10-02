import { Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transferChecked } from "@solana/spl-token";
import { getConnection } from "./wallet";
import { DOPE_MINT } from "./swap";

const DOPE_DECIMALS = 9;

export async function ensureDopeAta(owner: Keypair) {
  const conn = getConnection();
  const mint = DOPE_MINT;
  const ata = await getOrCreateAssociatedTokenAccount(conn, owner, mint, owner.publicKey);
  return ata.address;
}

export async function discoverDopeTokenAccounts(ownerPubkey: PublicKey) {
  const conn = getConnection();
  const mint = DOPE_MINT;
  const parsed = await conn.getParsedTokenAccountsByOwner(ownerPubkey, { mint });
  return parsed.value.map((v) => ({
    address: v.pubkey,
    rawAmount: BigInt((v.account.data as any)?.parsed?.info?.tokenAmount?.amount || '0'),
  }));
}

export async function syncDopeTokenAccounts(owner: Keypair) {
  const conn = getConnection();
  const ownerPk = owner.publicKey;
  const mint = DOPE_MINT;
  const ata = await ensureDopeAta(owner);

  const accounts = await discoverDopeTokenAccounts(ownerPk);
  const sources = accounts.filter((a) => a.address.toBase58() !== ata.toBase58() && a.rawAmount > BigInt(0));
  let moved = BigInt(0);
  for (const s of sources) {
    try {
      await transferChecked(conn, owner, s.address, mint, ata, owner, s.rawAmount, DOPE_DECIMALS);
      moved += s.rawAmount;
    } catch (e) {
      // ignore individual failures to keep best-effort consolidation
    }
  }
  return { ata: ata.toBase58(), movedUi: Number(moved) / 10 ** DOPE_DECIMALS };
}

