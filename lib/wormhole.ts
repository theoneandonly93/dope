import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js';
import * as wormhole from '@certusone/wormhole-sdk';
import { getConnection } from './wallet';

// Mainnet program IDs (Wormhole v2)
export const WORMHOLE_CORE_BRIDGE = new PublicKey('Bridge1pE7DUwQjBL3mVucZLqGfBCJ9Bx7uQ2ggusC7L');
export const WORMHOLE_TOKEN_BRIDGE = new PublicKey('worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth');

// Chain ID mapping (subset)
export const CHAIN_IDS: Record<string, number> = {
  solana: wormhole.CHAIN_ID_SOLANA,
  eth: wormhole.CHAIN_ID_ETH,
  bnb: wormhole.CHAIN_ID_BSC,
  btc: 0, // placeholder (Wormhole native BTC not directly supported) 
  ape: 0, // placeholder for custom chain
  sei: 0, // not in wormhole mapping here
  base: wormhole.CHAIN_ID_BASE,
};

export interface InitiateBridgeParams {
  from: Keypair;
  mint: string; // SPL mint (So111... for SOL wrap) 
  amount: number; // UI amount
  toChain: string; // key in CHAIN_IDS
  toAddress?: string; // hex or base58 for target chain
}

export interface InitiateBridgeResult {
  signature: string;
  sequence?: string;
  emitterAddress?: string;
  pendingSequence: boolean;
}

// Parse Wormhole sequence from transaction logs
// parseSequenceFromLogSolana expects a full TransactionResponse, so we supply that in initiateBridge.
export function parseSequenceFromLogsTx(tx: any): string | undefined {
  try { return wormhole.parseSequenceFromLogSolana(tx); } catch { return undefined; }
}

export function getEmitterAddress(): string {
  return wormhole.getEmitterAddressSolana(WORMHOLE_TOKEN_BRIDGE.toString());
}

// Convert a UI amount to integer base units given decimals
async function fetchDecimals(connection: Connection, mint: PublicKey): Promise<number> {
  if (mint.toBase58() === 'So11111111111111111111111111111111111111112') return 9; // wrapped SOL
  try {
    const info = await connection.getParsedAccountInfo(mint);
    // @ts-ignore
    return info?.value?.data?.parsed?.info?.decimals ?? 9;
  } catch { return 9; }
}

// Minimal native/SPL transfer builder (Phase 1: only create placeholder transaction; full integration requires wormhole-sdk detailed instructions)
export async function initiateBridge(params: InitiateBridgeParams): Promise<InitiateBridgeResult> {
  const { from, mint, amount, toChain, toAddress } = params;
  const connection = getConnection();
  const chainId = CHAIN_IDS[toChain];
  if (!chainId) throw new Error('Unsupported target chain');
  if (amount <= 0) throw new Error('Amount must be positive');
  if (!toAddress) throw new Error('Destination address required');

  // Destination address formatting: For EVM style addresses (0x...), strip 0x and left pad to 32 bytes
  let targetAddrBytes: Uint8Array;
  if (toAddress.startsWith('0x')) {
    const hex = toAddress.slice(2).toLowerCase();
    if (hex.length !== 40) throw new Error('EVM address must be 40 hex chars');
    const buf = Buffer.from(hex, 'hex');
    targetAddrBytes = new Uint8Array(32);
    targetAddrBytes.set(buf, 32 - buf.length);
  } else if (/^[1-9A-HJ-NP-Za-km-z]{32,}$/.test(toAddress)) {
    // Could support base58 for future chains; for now treat as error because target chain is EVM-focused in defaults
    throw new Error('Use an EVM 0x address for selected target chain');
  } else {
    throw new Error('Unsupported destination address format');
  }

  // Determine if mint is native SOL (wrapped SOL canonical mint)
  const isNativeSol = mint === 'So11111111111111111111111111111111111111112';
  // Convert UI amount to base units (lamports or token base units)
  let decimals = 9;
  if (!isNativeSol) {
    try { decimals = await fetchDecimals(connection, new PublicKey(mint)); } catch {}
  }
  const raw = BigInt(Math.floor(amount * Math.pow(10, decimals)));
  if (raw <= BigInt(0)) throw new Error('Amount after decimals is zero');

  let signedTx: Transaction;
  if (isNativeSol) {
    signedTx = await wormhole.transferNativeSol(
      connection,
      WORMHOLE_CORE_BRIDGE,
      WORMHOLE_TOKEN_BRIDGE,
      from.publicKey,
      raw,
      targetAddrBytes,
  chainId as wormhole.ChainId
    );
  } else {
    // Need associated token account for the mint
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const ata = await getAssociatedTokenAddress(new PublicKey(mint), from.publicKey);
    signedTx = await wormhole.transferFromSolana(
      connection,
      WORMHOLE_CORE_BRIDGE,
      WORMHOLE_TOKEN_BRIDGE,
      from.publicKey,
      ata,
      new PublicKey(mint),
      raw,
      targetAddrBytes,
  chainId as wormhole.ChainId,
      undefined,
      undefined,
      from.publicKey
    );
  }

  signedTx.feePayer = from.publicKey;
  const { blockhash } = await connection.getLatestBlockhash();
  signedTx.recentBlockhash = blockhash;
  signedTx.sign(from);
  const sig = await connection.sendRawTransaction(signedTx.serialize());
  // Wait for confirmation to parse sequence
  const conf = await connection.confirmTransaction(sig, 'confirmed');
  let sequence: string | undefined;
  if (conf?.value?.err == null) {
    try {
  const txInfo = await connection.getTransaction(sig, { commitment: 'confirmed' });
  sequence = parseSequenceFromLogsTx(txInfo);
    } catch {}
  }

  return { signature: sig, sequence, emitterAddress: getEmitterAddress(), pendingSequence: !sequence };
}
