import type { Address } from "viem";

import { BADGES } from "@/config/badges";
import type { LeaderboardRow } from "@/lib/leaderboard";
import type { ReferralRedemption } from "@/lib/fetchReferrals";

const DEMO: Address[] = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
  "0x4444444444444444444444444444444444444444",
  "0x5555555555555555555555555555555555555555",
];

export const PREVIEW_LEADERBOARD: LeaderboardRow[] = DEMO.map((address, i) => ({
  rank: i + 1,
  address,
  points: String(900 - i * 120),
  gmCount: String(40 - i * 5),
  deployCount: String(8 - i),
  lastActive: String(Math.floor(Date.now() / 1000) - i * 3600),
}));

export const PREVIEW_REFERRALS: ReferralRedemption[] = [
  {
    referee: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    blockNumber: "21000000",
    transactionHash:
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    referee: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    blockNumber: "20999000",
    transactionHash:
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
];

export function previewBadgesForAddress(address?: string) {
  return BADGES.map((badge, index) => {
    const minted = index < 2;
    const eligible = index < 4;
    return {
      ...badge,
      minted,
      eligible,
      canMint: eligible && !minted,
      userRank: badge.mintMode === "rank" ? 12 : null,
      rankSignerReady: true,
      rankSignerReason: null,
    };
  });
}

export function previewRankForAddress(address: string) {
  const lower = address.toLowerCase();
  const idx = PREVIEW_LEADERBOARD.findIndex(
    (e) => e.address.toLowerCase() === lower,
  );
  return idx >= 0 ? idx + 1 : 24;
}
