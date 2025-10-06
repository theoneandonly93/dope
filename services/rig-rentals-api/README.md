# Rig Rentals API (Microservice)

Microservice to generate mining wallets for multiple chains (e.g., Bitcoin, Fairbrix) and link them to a Solana owner from Dope Wallet. Provides REST endpoints to create/fetch a mining address per chain and persist mappings in Supabase.

## Features
- Generate chain-specific addresses via adapters
- Link address to `solanaOwner` (base58)
- Optional private key encryption at rest (AES-256-GCM)
- REST API with JSON validation (Zod)
- Supabase persistence

## Endpoints
- POST `/api/wallets` → create or return existing wallet for `{ solanaOwner, chain }`
- GET `/api/wallets/:solanaOwner` → list wallets for owner

## Quick Start
1. Copy `.env.example` → `.env` and fill values
2. Install deps and run dev

```bash
npm install
npm run dev
```

## Data Model (Supabase)
Create table `mining_wallets`:

```sql
create table if not exists public.mining_wallets (
  id uuid primary key default gen_random_uuid(),
  solana_owner text not null,
  chain text not null,
  address text not null,
  private_key_enc text, -- optional (base64 ciphertext)
  created_at timestamptz not null default now(),
  unique (solana_owner, chain)
);
```

## Security
- Store only public address unless you must manage withdrawals.
- If storing private keys, use `ENCRYPTION_KEY_BASE64` and never log secrets.

## Watchers
Use a separate worker (cron or service) to poll chain explorers and record payouts.