// Placeholder adapter — implement proper Fairbrix address generation later
import { createBitcoinWallet } from './bitcoin';

export function createFairbrixWallet() {
  // For now, reuse BTC address generator as a stub
  return createBitcoinWallet();
}
