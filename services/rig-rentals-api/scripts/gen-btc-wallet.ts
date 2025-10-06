import { createBitcoinWallet } from '../src/chains/bitcoin';

const w = createBitcoinWallet();
// eslint-disable-next-line no-console
console.log(JSON.stringify(w, null, 2));
