import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

export function createBitcoinWallet() {
  const keyPair = ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  if (!address) throw new Error('Failed to derive BTC address');
  return {
    address,
    privateKeyWIF: keyPair.toWIF(),
  };
}
