# Wormhole Bridging Flow (Alpha)

This project implements the Solana (source) side of Wormhole token bridging. After initiating a bridge transfer from the Token Detail modal, the UI polls guardians until a signed VAA is available.

## 1. Initiate Transfer
- Source chain: Solana (emits a Wormhole message)
- Supported target chains (alpha): Ethereum, BNB Chain, Base
- Unsupported (UI placeholders): Bitcoin, Ape Chain, Sei (no Wormhole mapping here yet)

The transfer transaction:
1. Uses Wormhole Token Bridge program (native SOL or SPL variant)
2. Emits a sequence in the program logs
3. Guardians later produce a signed VAA for that sequence

## 2. Poll for VAA
API route: `GET /api/bridge/vaa?chain=1&emitter=<emitterHex>&sequence=<seq>`
- `chain=1` is Wormhole chain id for Solana.
- Returns `{ pending: true }` until the guardian set has signed.
- Returns `{ pending: false, vaa: <base64> }` once available.

## 3. Redeem on Destination Chain (Manual for Now)
Until an in-app redemption flow is added:
1. Copy the base64 VAA from the UI once it appears.
2. Use an off-chain script or a Wormhole tool to post (redeem) the VAA on the destination chain token bridge contract.

### Example (EVM Pseudocode)
```ts
import { ethers } from 'ethers';
import { parseVaa, redeemOnEth } from '@certusone/wormhole-sdk';

async function redeem(vaaBase64: string, provider: ethers.Provider, signer: ethers.Signer, tokenBridgeAddress: string) {
  const vaaBytes = Buffer.from(vaaBase64, 'base64');
  // Optionally verify or parse
  const parsed = parseVaa(vaaBytes); // inspect fields
  const tx = await redeemOnEth(tokenBridgeAddress, signer, vaaBytes);
  console.log('Redemption tx hash:', tx.hash);
  await tx.wait();
}
```

### Gas & Relayers
- For some chains you can use automatic relayers. This MVP expects manual redemption.
- Ensure the destination wallet has enough native token for gas (ETH, BNB, etc.).

## 4. Post-Redemption
After redemption, the wrapped token (or native representation) will appear in the destination wallet (may require importing the token contract address in the wallet UI).

## 5. Roadmap
| Feature | Status |
|---------|--------|
| Initiate Solana transfer | Done |
| Guardian VAA polling | Done |
| UI: Sequence & VAA display | Done |
| In-app redemption (EVM) | Planned |
| Automatic relayer integration | Planned |
| Non-EVM chain support (Sei, etc.) | Planned |
| Error surfacing (ATA, insufficient funds) | Improving |

## 6. Troubleshooting
| Symptom | Likely Cause | Action |
|---------|-------------|--------|
| Polling stuck > 5 min | Guardians delayed | Click Manual Check; verify transaction finalized on Solana explorer |
| "Unsupported target chain" | Placeholder chain selected | Choose an EVM chain (Ethereum, BNB, Base) |
| VAA copied but redemption fails | Wrong chain bridge address | Verify token bridge contract address for target chain |
| Sequence missing | Transaction not yet fully confirmed | Wait another 10–20s, then Manual Check |

## 7. Environment Overrides
Set `GUARDIAN_API_BASE` in `.env.local` to point at a different guardian REST endpoint (e.g., testnet or a caching proxy).

---
This document will expand as redemption and relayer features are implemented.

## Appendix: Arbitrary SPL Token Swapping

The swap flow now supports any SPL token pair discoverable via Jupiter:
- Quote endpoint accepts `amountAtomic` to handle tokens with arbitrary decimals.
- UI fetches the global `tokenlist.json` and lets users search by symbol/name.
- Min receive is computed using the token decimals cache to avoid repeated RPC calls.

If a token isn\'t returning routes, Jupiter may not have liquidity or the mint is missing from the token list.
