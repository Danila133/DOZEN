#!/usr/bin/env bash
# Verify DOZEN contracts on Basescan (Base mainnet, chain 8453).
# Requires Etherscan API V2 key: https://etherscan.io/myapikey
#
# Usage:
#   export ETHERSCAN_API_KEY=your_key
#   bash scripts/verify-base.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env.local}"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# DOZEN Base mainnet (Remix deploy 2026-06-03)
HUB="0x31F05F76eccBcF329688e8AE8ebe4e6f222f0476"
TOKEN="0x052a57d62664b648855D47Bd0352B1a4e370ba43"
BADGE="0x2b6daB492e789cE54b77506E0970ccA5F492aa65"
STAKE="0x9eEB4D6FCdd89FD309543E1568DF244b388FeFC0"

DEPLOYER="0x6b4F19BCA7af51b72f419c1Ae056fD87B5a85194"
RANK_SIGNER="0xAD52cDAaFD927f5548d4347B7300bA8710d3E6A4"
TOKEN_SUPPLY="1050000000000000000000000"

API_KEY="${ETHERSCAN_API_KEY:-${BASESCAN_API_KEY:-}}"
if [[ -z "$API_KEY" ]]; then
  echo "Error: set ETHERSCAN_API_KEY in .env.local or export it"
  echo "  Get a free V2 key: https://etherscan.io/myapikey"
  exit 1
fi

echo "Building contracts (solc 0.8.24, optimizer OFF — matches Remix deploy)..."
forge build --force

VERIFY_ARGS=(
  --chain base
  --verifier etherscan
  --verifier-url "https://api.etherscan.io/v2/api?chainid=8453"
  --etherscan-api-key "$API_KEY"
  --compiler-version 0.8.24
  --num-of-optimizations 0
  --watch
)

verify_one() {
  local addr="$1"
  local contract="$2"
  shift 2
  echo ""
  echo "=== Verifying $contract at $addr ==="
  if forge verify-contract "$addr" "$contract" "${VERIFY_ARGS[@]}" "$@"; then
    echo "OK: $contract"
  else
    echo "FAILED: $contract (see message above)"
    return 1
  fi
}

FAIL=0

verify_one "$HUB" "contracts/src/Hub.sol:Hub" || FAIL=1

TOKEN_ARGS=$(cast abi-encode "constructor(address,uint256)" "$DEPLOYER" "$TOKEN_SUPPLY")
verify_one "$TOKEN" "contracts/src/AppToken.sol:AppToken" --constructor-args "$TOKEN_ARGS" || FAIL=1

BADGE_ARGS=$(cast abi-encode "constructor(address,address)" "$HUB" "$RANK_SIGNER")
verify_one "$BADGE" "contracts/src/BadgeNFT.sol:BadgeNFT" --constructor-args "$BADGE_ARGS" || FAIL=1

STAKE_ARGS=$(cast abi-encode "constructor(address)" "$TOKEN")
verify_one "$STAKE" "contracts/src/StakePool.sol:StakePool" --constructor-args "$STAKE_ARGS" || FAIL=1

echo ""
echo "Links:"
echo "  https://basescan.org/address/$HUB#code"
echo "  https://basescan.org/address/$TOKEN#code"
echo "  https://basescan.org/address/$BADGE#code"
echo "  https://basescan.org/address/$STAKE#code"

if [[ "$FAIL" -ne 0 ]]; then
  echo ""
  echo "Some contracts failed. Hub/Token usually verify from this repo."
  echo "If Badge/Stake fail with bytecode mismatch, verify them in Remix:"
  echo "  Compiler 0.8.24, Optimization OFF, same constructor args as above."
  exit 1
fi

echo ""
echo "All contracts submitted for verification on Basescan."
