# Vercel environment (DOZEN)

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Manifest, OG, share links |
| `BASE_RPC_URL` | Alchemy / Infura Base URL | Leaderboard + referrals API |
| `BADGE_RANK_SIGNER_PRIVATE_KEY` | `0x…` | Must match on-chain `rankSigner` |

After deploy, verify:

- `https://YOUR_DOMAIN/.well-known/farcaster.json`
- `https://YOUR_DOMAIN/api/leaderboard`
