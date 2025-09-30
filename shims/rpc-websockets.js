// Minimal browser shim to satisfy @solana/web3.js class extension
// Avoids bundling heavy deps and native ws in the client.

export class CommonClient {
  constructor() {
    // no-op
  }
  // Methods exist so subclassing in web3.js does not throw at call sites
  call() {
    return Promise.reject(new Error('rpc-websockets disabled in browser'));
  }
  notify() {
    return Promise.reject(new Error('rpc-websockets disabled in browser'));
  }
}

export function WebSocket(address, options) {
  // Use the native browser WebSocket if needed
  return new window.WebSocket(address);
}

export default {};

