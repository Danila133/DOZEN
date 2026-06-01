import { isAirdropTokenConfigured } from "@/config/airdropContract";
import { isBadgeContractConfigured } from "@/config/badgeContract";
import { isContractConfigured } from "@/config/contract";
import { isStakePoolConfigured } from "@/config/stakingContract";

/** Explicit override: NEXT_PUBLIC_PREVIEW_MODE=true|false (default: on when Hub not deployed). */
export function isPreviewMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_PREVIEW_MODE;
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return true;
  return !isContractConfigured;
}

/** UI + APIs treat the app as available (mock data when preview). */
export function isHubReadyForUi(): boolean {
  return isContractConfigured || isPreviewMode();
}

export function isBadgeReadyForUi(): boolean {
  return isBadgeContractConfigured || isPreviewMode();
}

export function isAirdropReadyForUi(): boolean {
  return isAirdropTokenConfigured || isPreviewMode();
}

export function isStakeReadyForUi(): boolean {
  return isStakePoolConfigured || isPreviewMode();
}

/** On-chain txs allowed (preview uses local simulation only). */
export function canSubmitOnChain(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  return isContractConfigured && opts.isConnected && !opts.wrongChain;
}

export function isHubLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  if (isPreviewMode()) {
    return opts.isConnected && !opts.wrongChain;
  }
  return canSubmitOnChain(opts);
}

export function isBadgeLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
}): boolean {
  if (isPreviewMode()) return isHubLiveMode(opts);
  return canSubmitOnChain(opts) && isBadgeContractConfigured;
}

export function isAirdropLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  airdropConfigured: boolean;
}): boolean {
  if (isPreviewMode()) return isHubLiveMode(opts);
  return canSubmitOnChain(opts) && opts.airdropConfigured;
}

export function isStakingLiveMode(opts: {
  isConnected: boolean;
  wrongChain: boolean;
  stakingConfigured: boolean;
}): boolean {
  if (isPreviewMode()) return isHubLiveMode(opts);
  return canSubmitOnChain(opts) && opts.stakingConfigured;
}
