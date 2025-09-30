import * as bip39 from "bip39";
import nacl from "tweetnacl";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey, Connection, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Buffer } from "buffer";

export type EncryptedData = {
  algo: "AES-GCM";
  iv: string; // base64
  salt: string; // base64
  iterations: number;
  cipherText: string; // base64
};

export type WalletScheme = "password" | "device";

export type StoredWallet = {
  encMnemonic: EncryptedData;
  pubkey: string; // base58 address
  createdAt: number;
  biometricEnabled?: boolean;
  scheme?: WalletScheme;
};

type StoredWalletWithMeta = StoredWallet & { id: string; name?: string };
type WalletStore = { version: 2; wallets: StoredWalletWithMeta[]; selectedId?: string };

const STORAGE_KEY = "dope_wallet_v1"; // keep same key; migrate single -> multi in-place
const DEVICE_SECRET_KEY = "dope_wallet_device_secret"; // base64 random 32 bytes
const SESSION_UNLOCK_KEY = "dope_wallet_session_unlocked";

const enc = new TextEncoder();
const dec = new TextDecoder();

// Ensure WebCrypto BufferSource typing compatibility across TS targets
function abFromU8(u8: Uint8Array): ArrayBuffer {
  // Create a standalone ArrayBuffer and copy bytes to avoid SAB typing issues
  const out = new ArrayBuffer(u8.byteLength);
  new Uint8Array(out).set(u8);
  return out;
}

function toB64(d: ArrayBuffer | Uint8Array) {
  const bytes = d instanceof ArrayBuffer ? new Uint8Array(d) : d;
  let str = "";
  bytes.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str);
}

function fromB64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveAesKey(password: string, salt: Uint8Array, iterations: number) {
  const baseKey = await crypto.subtle.importKey("raw", abFromU8(enc.encode(password)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: abFromU8(salt), iterations },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMnemonic(mnemonic: string, password: string): Promise<EncryptedData> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 250_000;
  const key = await deriveAesKey(password, salt, iterations);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: abFromU8(iv) }, key, abFromU8(enc.encode(mnemonic)));
  return {
    algo: "AES-GCM",
    iv: toB64(iv),
    salt: toB64(salt),
    iterations,
    cipherText: toB64(ct),
  };
}

export async function decryptMnemonic(ed: EncryptedData, password: string): Promise<string> {
  const salt = fromB64(ed.salt);
  const iv = fromB64(ed.iv);
  const key = await deriveAesKey(password, salt, ed.iterations);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: abFromU8(iv) }, key, abFromU8(fromB64(ed.cipherText)));
  return dec.decode(pt);
}

export function generateMnemonic(strength: 128 | 256 = 128) {
  const entropyBytes = strength / 8;
  const bytes = crypto.getRandomValues(new Uint8Array(entropyBytes));
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return bip39.entropyToMnemonic(hex);
}

export async function mnemonicToKeypair(mnemonic: string, account = 0) {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error("Invalid mnemonic");
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const path = `m/44'/501'/${account}'/0'`;
  const derived = derivePath(path, Buffer.from(seed).toString("hex"));
  const kp = nacl.sign.keyPair.fromSeed(new Uint8Array(derived.key));
  return Keypair.fromSecretKey(kp.secretKey);
}

function makeId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function emptyStore(): WalletStore {
  return { version: 2, wallets: [] };
}

function isSingleWalletShape(o: any): o is StoredWallet {
  return o && typeof o === "object" && "encMnemonic" in o && "pubkey" in o;
}

function loadStore(): WalletStore {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyStore();
  try {
    const parsed = JSON.parse(raw);
    // v2 store
    if (parsed && parsed.version === 2 && Array.isArray(parsed.wallets)) {
      return parsed as WalletStore;
    }
    // v1 single -> migrate to v2
    if (isSingleWalletShape(parsed)) {
      const id = makeId();
      const store: WalletStore = { version: 2, wallets: [{ ...(parsed as StoredWallet), id }], selectedId: id };
      saveStore(store);
      return store;
    }
  } catch {
    // fallthrough
  }
  return emptyStore();
}

function saveStore(store: WalletStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("dope:store"));
    } catch {}
  }
}

export function getWallets(): StoredWalletWithMeta[] {
  return loadStore().wallets;
}

export function getActiveWallet(): StoredWalletWithMeta | null {
  const store = loadStore();
  if (store.wallets.length === 0) return null;
  const active = store.wallets.find((w) => w.id === store.selectedId) || store.wallets[0];
  return active || null;
}

export function selectWallet(id: string) {
  const store = loadStore();
  if (!store.wallets.find((w) => w.id === id)) return;
  store.selectedId = id;
  saveStore(store);
}

function updateActiveWallet(mut: (w: StoredWalletWithMeta) => void) {
  const store = loadStore();
  const idx = store.wallets.findIndex((w) => w.id === store.selectedId);
  const i = idx >= 0 ? idx : 0;
  if (!store.wallets[i]) return;
  mut(store.wallets[i]);
  saveStore(store);
}

export function getStoredWallet(): StoredWallet | null {
  const aw = getActiveWallet();
  return aw ? { encMnemonic: aw.encMnemonic, pubkey: aw.pubkey, createdAt: aw.createdAt, biometricEnabled: aw.biometricEnabled, scheme: aw.scheme } : null;
}

export function setStoredWallet(w: StoredWallet) {
  // Back-compat: replace store with a single active wallet
  const store: WalletStore = { version: 2, wallets: [{ ...w, id: makeId() }], selectedId: undefined };
  store.selectedId = store.wallets[0].id;
  saveStore(store);
}

export function addWalletRecord(w: StoredWallet, name?: string) {
  const store = loadStore();
  const withMeta: StoredWalletWithMeta = { ...w, id: makeId(), name };
  store.wallets.push(withMeta);
  store.selectedId = withMeta.id;
  saveStore(store);
}

export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(SESSION_UNLOCK_KEY);
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1";
}

export function markUnlocked() {
  sessionStorage.setItem(SESSION_UNLOCK_KEY, "1");
}

export async function createNewWallet(password: string) {
  const mnemonic = generateMnemonic(128);
  const kp = await mnemonicToKeypair(mnemonic);
  const enc = await encryptMnemonic(mnemonic, password);
  const record: StoredWallet = {
    encMnemonic: enc,
    pubkey: kp.publicKey.toBase58(),
    createdAt: Date.now(),
    scheme: "password",
  };
  addWalletRecord(record);
  return { mnemonic, address: record.pubkey };
}

export async function importWalletFromMnemonic(mnemonic: string, password: string) {
  const kp = await mnemonicToKeypair(mnemonic);
  const enc = await encryptMnemonic(mnemonic, password);
  const record: StoredWallet = {
    encMnemonic: enc,
    pubkey: kp.publicKey.toBase58(),
    createdAt: Date.now(),
    scheme: "password",
  };
  addWalletRecord(record);
  return { address: record.pubkey };
}

export async function unlockWithPassword(password: string) {
  const stored = getStoredWallet();
  if (!stored) throw new Error("No wallet on this device");
  const mnemonic = await decryptMnemonic(stored.encMnemonic, password);
  const kp = await mnemonicToKeypair(mnemonic);
  markUnlocked();
  return kp;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const aw = getActiveWallet();
  if (!aw) throw new Error("No active wallet");
  if (aw.scheme !== "password") throw new Error("Wallet does not use password");
  const mnemonic = await decryptMnemonic(aw.encMnemonic, oldPassword);
  const enc = await encryptMnemonic(mnemonic, newPassword);
  updateActiveWallet((w) => {
    w.encMnemonic = enc;
    w.scheme = "password";
  });
}

export async function setPasswordForDeviceWallet(newPassword: string) {
  const aw = getActiveWallet();
  if (!aw) throw new Error("No active wallet");
  if (aw.scheme !== "device") throw new Error("Wallet already has password");
  const mnemonic = await decryptWithDeviceSecret(aw.encMnemonic);
  const enc = await encryptMnemonic(mnemonic, newPassword);
  updateActiveWallet((w) => {
    w.encMnemonic = enc;
    w.scheme = "password";
  });
}

export function getRpcEndpoint() {
  if (typeof window === "undefined") {
    return process.env.RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
  }
  return "/api/rpc"; // proxy through Next API to avoid CORS/403
}

export function getWsEndpoint(): string | undefined {
  // Only NEXT_PUBLIC_* are exposed to the browser
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_RPC_WS_URL as string | undefined;
  }
  return (process.env.RPC_WS_URL || process.env.NEXT_PUBLIC_RPC_WS_URL) as string | undefined;
}

export function getConnection() {
  const http = getRpcEndpoint();
  const ws = getWsEndpoint();
  const commitment: any = "confirmed";
  if (ws) {
    return new Connection(http, { commitment, wsEndpoint: ws } as any);
  }
  return new Connection(http, commitment);
}

export const LAMPORTS_PER_DOPE = 1_000_000_000; // align with Solana-style precision

export function lamportsToDope(lamports: number) {
  return lamports / LAMPORTS_PER_DOPE;
}

export async function getSolBalance(pubkey: string) {
  const conn = getConnection();
  try {
    const lamports = await conn.getBalance(new PublicKey(pubkey));
    return lamportsToDope(lamports);
  } catch {
    return 0;
  }
}

export async function sendSol(from: Keypair, toAddress: string, amountSol: number) {
  const conn = getConnection();
  const tx = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: from.publicKey, toPubkey: new PublicKey(toAddress), lamports: Math.round(amountSol * LAMPORTS_PER_DOPE) })
  );
  const sig = await conn.sendTransaction(tx, [from]);
  return sig;
}

export function subscribeBalance(pubkey: string, cb: (balanceDope: number) => void): () => void {
  const conn = getConnection();
  try {
    const id = conn.onAccountChange(new PublicKey(pubkey), (accInfo) => {
      cb(lamportsToDope(accInfo.lamports));
    }, "confirmed");
    return () => { try { conn.removeAccountChangeListener(id); } catch {} };
  } catch {
    return () => {};
  }
}

export type RecentTx = {
  signature: string;
  slot: number;
  time: number | null;
  change: number | null; // DOPE delta for this address
  status: "success" | "error" | "unknown";
};

export async function getRecentTransactions(address: string, limit = 10): Promise<RecentTx[]> {
  const conn = getConnection();
  const pk = new PublicKey(address);
  let sigs: any[] = [];
  try { sigs = await conn.getSignaturesForAddress(pk, { limit }); } catch { return []; }
  if (sigs.length === 0) return [];
  let parsed: any[] = [];
  try { parsed = await conn.getParsedTransactions(sigs.map((s) => s.signature), { maxSupportedTransactionVersion: 0 }); } catch { return []; }
  const results: RecentTx[] = [];
  for (let i = 0; i < sigs.length; i++) {
    const sig = sigs[i];
    const tx = parsed[i];
    let change: number | null = null;
    let status: "success" | "error" | "unknown" = "unknown";
    let time: number | null = sig.blockTime || null;
    if (tx && tx.meta) {
      const accountIndex = tx.transaction.message.accountKeys.findIndex((k: any) => ("pubkey" in k ? k.pubkey.toBase58?.() : k.toBase58?.()) === address);
      if (accountIndex >= 0 && tx.meta.preBalances && tx.meta.postBalances) {
        const pre = tx.meta.preBalances[accountIndex];
        const post = tx.meta.postBalances[accountIndex];
        change = lamportsToDope(post - pre);
      }
      const err = tx.meta.err;
      status = err ? "error" : "success";
      if (time == null && (tx as any).blockTime) time = (tx as any).blockTime;
    }
    results.push({ signature: sig.signature, slot: sig.slot, time, change, status });
  }
  return results;
}

// ---- Encrypted chat helpers (MVP on-chain via memo) ----
const DOPECHAT_PREFIX_PUB = "dopechat:pub:";
const DOPECHAT_PREFIX_MSG = "dopechat:msg:";
const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

async function sha256Bytes(input: string): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return new Uint8Array(buf);
}

export async function deriveChatKeypairFromMnemonic(mnemonic: string) {
  const seed = await sha256Bytes("dope-chat-v1|" + mnemonic);
  const sk = seed.slice(0, 32);
  const kp = nacl.box.keyPair.fromSecretKey(sk);
  return kp; // {publicKey: Uint8Array, secretKey: Uint8Array}
}

export async function getMnemonicForActiveWallet(password?: string): Promise<string> {
  const stored = getStoredWallet();
  if (!stored) throw new Error("No wallet on this device");
  if (stored.scheme === "device") {
    // device-encrypted
    // @ts-ignore - use internal helper
    return await decryptWithDeviceSecret(stored.encMnemonic);
  }
  if (stored.scheme === "password") {
    if (!password) throw new Error("Password required for chat");
    return await decryptMnemonic(stored.encMnemonic, password);
  }
  throw new Error("Unsupported wallet scheme");
}

function buildMemoInstruction(text: string) {
  return new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: Buffer.from(text, "utf8") });
}

export async function publishChatKey(from: Keypair, chatPubB64: string) {
  const conn = getConnection();
  const memo = `${DOPECHAT_PREFIX_PUB}${chatPubB64}`;
  const tx = new Transaction().add(buildMemoInstruction(memo));
  return await conn.sendTransaction(tx, [from]);
}

export async function getPublishedChatKeyB64(address: string): Promise<string | null> {
  const conn = getConnection();
  const pk = new PublicKey(address);
  const sigs = await conn.getSignaturesForAddress(pk, { limit: 50 });
  if (sigs.length === 0) return null;
  const parsed = await conn.getParsedTransactions(sigs.map((s) => s.signature), { maxSupportedTransactionVersion: 0 });
  for (let i = 0; i < parsed.length; i++) {
    const tx = parsed[i];
    if (!tx) continue;
    // scan instructions for memo content
    const ix = (tx.transaction.message as any).instructions || [];
    for (const ins of ix) {
      // parsed form may include 'program' or 'programId'
      const pid = (ins.programId as PublicKey) || undefined;
      const program = (ins as any).program as string | undefined;
      const dataField = (ins as any).parsed?.params?.[0] || (ins as any).data || undefined;
      // Fallback: log messages often contain memo text
      if (program === "spl-memo") {
        const memoText = (ins as any).parsed || dataField;
        if (typeof memoText === "string" && memoText.startsWith(DOPECHAT_PREFIX_PUB)) {
          return memoText.slice(DOPECHAT_PREFIX_PUB.length);
        }
      }
      if (pid && pid.toBase58 && pid.toBase58() === MEMO_PROGRAM_ID.toBase58()) {
        // data is base58 in parsed form; skip for simplicity
        // rely on logs as better source
      }
    }
    const logs: string[] | undefined = tx.meta?.logMessages || undefined;
    if (logs) {
      for (const l of logs) {
        const idx = l.indexOf(DOPECHAT_PREFIX_PUB);
        if (idx >= 0) {
          return l.slice(idx + DOPECHAT_PREFIX_PUB.length).trim();
        }
      }
    }
  }
  return null;
}

export async function sendEncryptedChatMessage(
  fromWallet: Keypair,
  senderChatSk: Uint8Array,
  senderChatPkB64: string,
  recipientWalletAddress: string,
  plaintext: string
) {
  if (plaintext.length > 220) throw new Error("Message too long (max 220 chars)");
  const recipientChatB64 = await getPublishedChatKeyB64(recipientWalletAddress);
  if (!recipientChatB64) throw new Error("Recipient has not published chat key");
  const recipientChatPk = fromB64(recipientChatB64);
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const msgBytes = enc.encode(plaintext);
  const box = nacl.box(msgBytes, nonce, recipientChatPk, senderChatSk);
  const payload = {
    v: 1,
    to: recipientChatB64,
    from: senderChatPkB64,
    nonce: toB64(nonce),
    box: toB64(box),
  };
  const payloadB64 = btoa(JSON.stringify(payload));
  const memo = `${DOPECHAT_PREFIX_MSG}${payloadB64}`;
  const conn = getConnection();
  const tx = new Transaction().add(buildMemoInstruction(memo));
  const sig = await conn.sendTransaction(tx, [fromWallet]);
  return sig;
}

export type ChatMessage = { id: string; from: "me" | "them"; text: string; time: number | null };

export async function getConversation(
  myAddress: string,
  theirAddress: string,
  myChatSk: Uint8Array,
  myChatPkB64: string,
  limit = 40
): Promise<ChatMessage[]> {
  const conn = getConnection();
  const a = await conn.getSignaturesForAddress(new PublicKey(myAddress), { limit });
  const b = await conn.getSignaturesForAddress(new PublicKey(theirAddress), { limit });
  const sigSet = new Map<string, number>();
  for (const s of [...a, ...b]) sigSet.set(s.signature, s.slot);
  const sigs = Array.from(sigSet.keys());
  if (sigs.length === 0) return [];
  const parsed = await conn.getParsedTransactions(sigs, { maxSupportedTransactionVersion: 0 });
  const out: ChatMessage[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const tx = parsed[i];
    if (!tx) continue;
    const logs: string[] | undefined = tx.meta?.logMessages || undefined;
    let found: string | null = null;
    if (logs) {
      for (const l of logs) {
        const idx = l.indexOf(DOPECHAT_PREFIX_MSG);
        if (idx >= 0) { found = l.slice(idx + DOPECHAT_PREFIX_MSG.length).trim(); break; }
      }
    }
    if (!found) continue;
    try {
      const payload = JSON.parse(atob(found));
      if (!payload || payload.to !== myChatPkB64) continue;
      const nonce = fromB64(payload.nonce);
      const box = fromB64(payload.box);
      // Try decrypt with my secret; sender can be anyone with payload.from
      const senderPk = fromB64(payload.from);
      const plain = nacl.box.open(box, nonce, senderPk, myChatSk);
      if (!plain) continue;
      const text = dec.decode(plain);
      const fromThem = payload.from !== myChatPkB64;
      out.push({ id: tx.transaction.signatures[0], from: fromThem ? "them" : "me", text, time: tx.blockTime || null });
    } catch {}
  }
  // sort by time asc
  out.sort((x, y) => (x.time || 0) - (y.time || 0));
  return out;
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    // @ts-ignore
    if (!window.PublicKeyCredential) return false;
    // @ts-ignore
    const supported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
    return !!supported;
  } catch {
    return false;
  }
}

export async function biometricGate(credentialId?: ArrayBuffer): Promise<boolean> {
  try {
    // @ts-ignore
    if (!window.PublicKeyCredential) return false;
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const pubKey: any = { challenge, userVerification: "required" };
    if (credentialId) {
      (pubKey as any).allowCredentials = [{ id: credentialId, type: "public-key" }];
    }
    const cred = (await navigator.credentials.get({ publicKey: pubKey })) as any;
    return !!cred;
  } catch {
    return false;
  }
}

// Device-secret helpers (passwordless local encryption)
function ensureDeviceSecret(): Uint8Array {
  let b64 = localStorage.getItem(DEVICE_SECRET_KEY);
  if (!b64) {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    b64 = toB64(bytes);
    localStorage.setItem(DEVICE_SECRET_KEY, b64);
  }
  return fromB64(b64);
}

async function encryptWithDeviceSecret(plaintext: string): Promise<EncryptedData> {
  const secret = ensureDeviceSecret();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey("raw", abFromU8(secret), "AES-GCM", false, ["encrypt"]);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: abFromU8(iv) }, key, abFromU8(enc.encode(plaintext)));
  return { algo: "AES-GCM", iv: toB64(iv), salt: toB64(new Uint8Array(0)), iterations: 0, cipherText: toB64(ct) };
}

async function decryptWithDeviceSecret(ed: EncryptedData): Promise<string> {
  const secret = ensureDeviceSecret();
  const iv = fromB64(ed.iv);
  const key = await crypto.subtle.importKey("raw", abFromU8(secret), "AES-GCM", false, ["decrypt"]);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: abFromU8(iv) }, key, abFromU8(fromB64(ed.cipherText)));
  return dec.decode(pt);
}

export async function createWalletImmediateSave() {
  const mnemonic = generateMnemonic(128);
  const kp = await mnemonicToKeypair(mnemonic);
  const enc = await encryptWithDeviceSecret(mnemonic);
  const record: StoredWallet = {
    encMnemonic: enc,
    pubkey: kp.publicKey.toBase58(),
    createdAt: Date.now(),
    scheme: "device",
  };
  addWalletRecord(record);
  markUnlocked();
  return { mnemonic, address: record.pubkey, keypair: kp };
}

export async function unlockWithDevice() {
  const stored = getStoredWallet();
  if (!stored) throw new Error("No wallet on this device");
  const mnemonic = await decryptWithDeviceSecret(stored.encMnemonic);
  const kp = await mnemonicToKeypair(mnemonic);
  markUnlocked();
  return kp;
}
