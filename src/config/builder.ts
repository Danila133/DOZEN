import { Attribution } from "ox/erc8021";

import { BASE_BUILDER_CODE } from "@/config/app";

/** Base Builder Code from base.dev → Settings → Builder Codes */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE?.trim() || BASE_BUILDER_CODE;

/** ERC-8021 suffix — pass on every wallet writeContract (browser + mini app) */
export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

/** ERC-5792 wallet_sendCalls — required for browser wallets (MetaMask, Coinbase) */
export const BUILDER_CALLS_CAPABILITIES = {
  dataSuffix: {
    value: BUILDER_DATA_SUFFIX,
    optional: true,
  },
} as const;
