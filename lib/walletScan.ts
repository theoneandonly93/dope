import { PublicKey } from "@solana/web3.js";
import { DOPE_MINT } from "./swap";
import { DERIVATION_PRESETS, getConnection, mnemonicToKeypairFromPath } from "./wallet";

export async function getDopeBalanceForAddress(address: string): Promise<number> {
  try {
    const conn = getConnection();
    const owner = new PublicKey(address);
    const mint = new PublicKey(DOPE_MINT);
    const parsed = await conn.getParsedTokenAccountsByOwner(owner, { mint });
    if (!parsed || parsed.value.length === 0) return 0;
    const info: any = parsed.value[0].account.data;
    const ui = info?.parsed?.info?.tokenAmount?.uiAmount;
    return typeof ui === 'number' ? ui : 0;
  } catch {
    return 0;
  }
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr as any)) as any; }

function generateCandidatePaths(maxAccount = 5, maxChange = 2, maxIndex = 2): string[] {
  const baseA: string[] = [];
  for (let a = 0; a <= maxAccount; a++) {
    for (let c = 0; c <= maxChange; c++) {
      baseA.push(`m/44'/501'/${a}'/${c}'`);
      for (let i = 0; i <= maxIndex; i++) {
        baseA.push(`m/44'/501'/${a}'/${c}'/${i}'`);
      }
    }
  }
  const preset = DERIVATION_PRESETS.map((p) => p.path);
  return uniq([ ...preset, ...baseA ]);
}

export async function scanMnemonicForAccounts(mnemonic: string) {
  const results: { path: string; pubkey: string; balance: number }[] = [];
  const candidates = generateCandidatePaths();
  for (const path of candidates) {
    try {
      const kp = await mnemonicToKeypairFromPath(mnemonic, path);
      const pubkey = kp.publicKey.toBase58();
      const balance = await getDopeBalanceForAddress(pubkey);
      results.push({ path, pubkey, balance });
    } catch {
      // ignore and continue
    }
  }
  return results;
}
