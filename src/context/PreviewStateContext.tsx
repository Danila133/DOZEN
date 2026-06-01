"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEPLOY_FEE_WEI,
  GM_FEE_WEI,
  POINTS_PER_FREE_DEPLOY,
  POINTS_PER_FREE_GM,
} from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import { isPreviewMode } from "@/config/preview";

type PreviewState = {
  points: bigint;
  gmCount: bigint;
  deployCount: bigint;
  referralCount: bigint;
  freeRemaining: bigint;
  freeDeployAvailable: boolean;
  isCodeRegistered: boolean;
  hasRedeemed: boolean;
  airdropClaimed: bigint;
  boostActive: boolean;
  stakedBalance: bigint;
  stakeEarned: bigint;
};

const defaultState: PreviewState = {
  points: 480n,
  gmCount: 12n,
  deployCount: 3n,
  referralCount: 2n,
  freeRemaining: 1n,
  freeDeployAvailable: true,
  isCodeRegistered: true,
  hasRedeemed: false,
  airdropClaimed: 0n,
  boostActive: false,
  stakedBalance: 0n,
  stakeEarned: 0n,
};

type PreviewActions = {
  previewGm: () => void;
  previewDeploy: () => void;
  previewRegisterCode: () => void;
  previewRedeemCode: () => void;
  previewClaimAirdrop: (pointsToSpend: bigint) => void;
  previewStake: (amount: bigint) => void;
  previewUnstake: (amount: bigint) => void;
  resetPreview: () => void;
};

const PreviewStateContext = createContext<
  (PreviewState & PreviewActions) | null
>(null);

export function PreviewStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>(defaultState);

  const previewGm = useCallback(() => {
    setState((s) => {
      const free = s.freeRemaining > 0n;
      const pts = free ? BigInt(POINTS_PER_FREE_GM) : 20n;
      return {
        ...s,
        gmCount: s.gmCount + 1n,
        points: s.points + pts,
        freeRemaining: free ? s.freeRemaining - 1n : s.freeRemaining,
      };
    });
  }, []);

  const previewDeploy = useCallback(() => {
    setState((s) => {
      const free = s.freeDeployAvailable;
      const pts = free ? BigInt(POINTS_PER_FREE_DEPLOY) : 40n;
      return {
        ...s,
        deployCount: s.deployCount + 1n,
        points: s.points + pts,
        freeDeployAvailable: false,
      };
    });
  }, []);

  const previewRegisterCode = useCallback(() => {
    setState((s) => ({ ...s, isCodeRegistered: true }));
  }, []);

  const previewRedeemCode = useCallback(() => {
    setState((s) => ({
      ...s,
      hasRedeemed: true,
      points: s.points + BigInt(POINTS_PER_REFERRAL),
      referralCount: s.referralCount + 1n,
    }));
  }, []);

  const previewClaimAirdrop = useCallback((pointsToSpend: bigint) => {
    setState((s) => ({
      ...s,
      points: s.points - pointsToSpend,
      airdropClaimed: s.airdropClaimed + pointsToSpend,
    }));
  }, []);

  const previewStake = useCallback((amount: bigint) => {
    setState((s) => ({
      ...s,
      stakedBalance: s.stakedBalance + amount,
    }));
  }, []);

  const previewUnstake = useCallback((amount: bigint) => {
    setState((s) => ({
      ...s,
      stakedBalance:
        s.stakedBalance > amount ? s.stakedBalance - amount : 0n,
    }));
  }, []);

  const resetPreview = useCallback(() => setState(defaultState), []);

  const value = useMemo(
    () => ({
      ...state,
      previewGm,
      previewDeploy,
      previewRegisterCode,
      previewRedeemCode,
      previewClaimAirdrop,
      previewStake,
      previewUnstake,
      resetPreview,
    }),
    [
      state,
      previewGm,
      previewDeploy,
      previewRegisterCode,
      previewRedeemCode,
      previewClaimAirdrop,
      previewStake,
      previewUnstake,
      resetPreview,
    ],
  );

  if (!isPreviewMode()) {
    return <>{children}</>;
  }

  return (
    <PreviewStateContext.Provider value={value}>
      {children}
    </PreviewStateContext.Provider>
  );
}

export function usePreviewState() {
  return useContext(PreviewStateContext);
}

/** Hub-like stats merged from preview store when in preview mode. */
export function usePreviewHubStats() {
  const ctx = usePreviewState();
  if (!ctx) return null;

  const now = Math.floor(Date.now() / 1000);

  return {
    gmCount: ctx.gmCount,
    points: ctx.points,
    lastGmAt: BigInt(now - 120),
    freeRemaining: ctx.freeRemaining,
    deployCount: ctx.deployCount,
    freeDeployAvailable: ctx.freeDeployAvailable,
    totalGms: 10_000n,
    totalDeploys: 500n,
    gmFeeOnChain: GM_FEE_WEI,
    deployFeeOnChain: DEPLOY_FEE_WEI,
    minInterval: 60n,
    referralCount: ctx.referralCount,
    airdropClaimed: ctx.airdropClaimed,
    boostActiveUntil: ctx.boostActive ? BigInt(now + 3600) : 0n,
    freeBoostAvailable: !ctx.boostActive,
    boostCount: 1n,
    boostFeeOnChain: GM_FEE_WEI,
    boostActive: ctx.boostActive,
    refreshStats: async () => {},
    previewGm: ctx.previewGm,
    previewDeploy: ctx.previewDeploy,
    isCodeRegistered: ctx.isCodeRegistered,
    hasRedeemed: ctx.hasRedeemed,
    previewRegisterCode: ctx.previewRegisterCode,
    previewRedeemCode: ctx.previewRedeemCode,
    airdropClaimedWei: ctx.airdropClaimed,
    stakedBalance: ctx.stakedBalance,
    stakeEarned: ctx.stakeEarned,
    previewClaimAirdrop: ctx.previewClaimAirdrop,
    previewStake: ctx.previewStake,
    previewUnstake: ctx.previewUnstake,
  };
}
