import { Attribution } from "ox/erc8021";

import { BASE_BUILDER_CODE } from "@/config/app";

/** Base Builder Code from base.dev → Settings → Builder Codes */
export const BUILDER_CODE =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE?.trim() || BASE_BUILDER_CODE;

/** ERC-8021 suffix appended to calldata for Farcaster + browser attribution. */
export const BUILDER_DATA_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});
