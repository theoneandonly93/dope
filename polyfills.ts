// Ensure Buffer is available globally in the browser before any libs run
// Some libraries (e.g. @solana/web3.js) expect global Buffer
import { Buffer } from 'buffer';

try {
  const g: any = typeof globalThis !== 'undefined' ? (globalThis as any) : (window as any);
  if (!g.Buffer) {
    g.Buffer = Buffer;
  }
} catch {
  // no-op
}

