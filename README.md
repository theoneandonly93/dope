# DOPE Wallet (PWA)

- Next.js 13 app-dir PWA with service worker and manifest
- Client-side encrypted wallet with password unlock and optional biometric gate
- Phantom-like dark UI optimized for mobile

## Getting Started

1. Copy `.env.local.example` to `.env.local` and adjust values if needed.
2. Install deps and run in dev:
   - `npm install`
   - `npm run dev`
3. Open the printed URL (port auto-selects).

## Notes

- Password encrypts the secret phrase using WebCrypto (AES-GCM + PBKDF2).
- Biometric acts as a quick user-verification gate. It does not replace the password-derived encryption key.
- RPC Endpoints & Failover:
  - Primary RPC is taken from `NEXT_PUBLIC_RPC_URLS` (comma separated) or `RPC_URLS` if set.
  - Otherwise falls back to single `NEXT_PUBLIC_RPC_URL` / `RPC_URL` / `SOLANA_RPC_URL`.
  - If none provided, a bundled QuickNode endpoint + `https://api.mainnet-beta.solana.com` are used.
  - Runtime health checks every 15s and per-call error interception rotate to the next healthy endpoint after 2 consecutive failures.
  - Automatic primary restoration is attempted after 60s of stability on a backup.
  - Window events (`dope:rpc`) are dispatched with statuses: `init`, `rotate`, `restore`, `degraded`.
  - Trailing slashes are normalized (excessive `////` collapsed to single `/`).
  - Example: `NEXT_PUBLIC_RPC_URLS="https://rpc1.mainnet.solana.com,https://rpc2.backup.net/"`.

## Airdrop utility (SPL or devnet SOL)

Script: `scripts/airdrop.ts`

- Dry-run by default (set `DRY_RUN=true` or omit `--execute`).
- Supports SPL token airdrop (fixed `--amount` per recipient or `--percent` of admin balance distributed equally).
- Creates ATAs as needed; if `MINT_AUTH_SECRET` is provided and matches mint authority, mints directly to recipients; otherwise transfers from admin ATA after checking balance.
- Outputs CSV receipts to `airdrop_receipts.csv` by default.

Env
- `RPC_URL` — Solana RPC (defaults to devnet)
- `ADMIN_SECRET_KEY` — base58 secret key (or use `--keypair <path>`)
- `MINT_ADDRESS` — SPL mint (omit and use `--sol` for devnet SOL faucet)
- `MINT_AUTH_SECRET` — base58 mint authority (optional)
- `DRY_RUN=true` — safety default

Examples

1) Prepare addresses
```
cp scripts/addresses.sample.txt addresses.txt
# edit addresses.txt to your 10 recipients
```

2) Dry run SPL token airdrop (2% of admin balance distributed equally)
```
DRY_RUN=true npx ts-node scripts/airdrop.ts --addresses addresses.txt --percent 2 --mint $MINT_ADDRESS
```

3) Execute fixed amount per recipient
```
npx ts-node scripts/airdrop.ts --addresses addresses.txt --amount 12.5 --mint $MINT_ADDRESS --execute --yes
```

4) Devnet SOL faucet airdrop
```
npx ts-node scripts/airdrop.ts --addresses addresses.txt --amount 0.1 --sol --execute --yes
```

Notes
- The script prints a summary and requires confirmation unless `--yes` is passed.
- When not using a mint authority, the total required must be ≤ admin token balance.

## Virtual Card Top-Up (DOPE → USDC)

This repo includes a stubbed end-to-end flow to top up a virtual card balance in USDC using DOPE.

Flow overview
- Frontend pages
  - `app/wallet/card/topup/page.tsx`: enter DOPE amount, see estimated USDC, submit top-up.
  - `app/wallet/card/page.tsx`: view USDC card balance and card activity (top-ups/spends).
  - `app/card/page.tsx`: virtual card UI with quick links to Top Up and Card.
- Backend (stub)
  - `app/api/card/topup`: POST { pubkey, amount, signature? } → verifies deposit (stub) and credits ledger.
  - `app/api/card/balance`: GET ?pubkey=… → returns USDC balance.
  - `app/api/card/spend`: POST { pubkey, amount, desc? } → deducts from ledger.
  - `app/api/card/transactions`: GET ?pubkey=… → returns card activity.
- Service & swap helpers
  - `backend/card-service.ts`: in-memory ledger for balances and transactions.
  - `lib/swap.ts`: DOPE→USDC quoting (stub: 1 DOPE ≈ 1 USDC, minus fee+slippage).

Production notes
- Replace the stubbed verification in `backend/card-service.ts` with real on-chain checks:
  - Confirm DOPE token transfer to the CardVault PDA.
  - Perform on-chain swap to USDC with slippage controls using a DEX router (e.g., Jupiter/Raydium).
- Persist the ledger in a database and add authentication.
- Build the `programs/card_vault` Anchor program to handle `deposit_and_swap` and `withdraw_usdc` flows.

API example
```
POST /api/card/topup
{
  "pubkey": "<USER_PUBKEY>",
  "amount": 1.25,
  "signature": "<TRANSFER_SIGNATURE>"
}
```

Testing
- See `test/addresses.topup.example.txt` for a sample payload. The current stub accepts any non-empty signature (≥ 16 chars).
