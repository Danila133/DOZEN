# Vercel environment (DOZEN)

Add in **Project → Settings → Environment Variables** (Production + Preview + Development).

## Required

| Variable | Production value | Environments |
|----------|------------------|--------------|
| `NEXT_PUBLIC_SITE_URL` | `https://dozen-tau.vercel.app` | Production, Preview, Development |
| `NEXT_PUBLIC_PREVIEW_MODE` | `false` | Production, Preview |
| `BASE_RPC_URL` | Alchemy Base URL (see below) | Production, Preview, Development |
| `BADGE_RANK_SIGNER_PRIVATE_KEY` | `0x…` (secret) | Production, Preview, Development |

**`BADGE_RANK_SIGNER_PRIVATE_KEY`** must be the private key for on-chain rank signer:

`0xAD52cDAaFD927f5548d4347B7300bA8710d3E6A4`

Without it, rank badge mint API (`/api/badges/rank`) will fail.

**`BASE_RPC_URL`** — get a free key at [alchemy.com](https://www.alchemy.com) → Base Mainnet:

```
https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
```

Fallback (rate-limited, OK for testing):

```
https://mainnet.base.org
```

## Optional

| Variable | Value | Notes |
|----------|-------|--------|
| `NEXT_PUBLIC_BASE_BUILDER_CODE` | `bc_wnu57oz2` | Already default in `src/config/app.ts` |
| `HUB_DEPLOY_FROM_BLOCK` | `46822901` | Already in `contract.ts`; optional API hint |

## Already in code (no env needed)

- Base App ID: `6a1f5559771ed4d9a6a2c585` → `src/config/app.ts`
- Farcaster manifest + domain association → `src/config/manifest.ts`
- Talent verification meta → `src/config/app.ts`
- Hub / token / badge / stake addresses → `src/config/*.ts`

## After deploy

1. **Redeploy** (env vars apply only after redeploy).
2. Check:
   - https://dozen-tau.vercel.app/.well-known/farcaster.json
   - https://dozen-tau.vercel.app/api/leaderboard
   - View source → `base:app_id`, `talentapp:project_verification`
3. Connect wallet on **Base mainnet** — GM / deploy should hit live Hub.

## Local `.env.local` (mirror production)

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PREVIEW_MODE=false
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BADGE_RANK_SIGNER_PRIVATE_KEY=0xYOUR_RANK_SIGNER_KEY
```
