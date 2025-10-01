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

export async function scanMnemonicForAccounts(mnemonic: string) {
  const results: { path: string; pubkey: string; balance: number }[] = [];
  for (const p of DERIVATION_PRESETS) {
    try {
      const kp = await mnemonicToKeypairFromPath(mnemonic, p.path);
      const pubkey = kp.publicKey.toBase58();
      const balance = await getDopeBalanceForAddress(pubkey);
      results.push({ path: p.path, pubkey, balance });
    } catch {
      // ignore and continue
    }
  }
  return results;
}

