"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits } from "viem";

import {
  APP_TOKEN_ADDRESS,
  appTokenAbi,
  isAirdropTokenConfigured,
} from "@/config/airdropContract";
import {
  DEPLOY_CHAIN_ID,
  HUB_CONTRACT_ADDRESS,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import { AIRDROP_MIN_POINTS, POINTS_PER_A_TOKEN } from "@/config/airdrop";
import { isPreviewMode } from "@/config/preview";
import { usePreviewHubStats } from "@/context/PreviewStateContext";

export function useAirdrop() {
  const preview = usePreviewHubStats();
  const { address } = useAccount();
  const enabled =
    Boolean(address) && isContractConfigured && !isPreviewMode();

  const hubContracts = useMemo(() => {
    if (!address) return [];
    return [
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "points" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "airdropClaimed" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "airdropToken" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
    ];
  }, [address]);

  const { data, refetch: refetchHub } = useReadContracts({
    contracts: hubContracts,
    query: { enabled, staleTime: 0 },
  });

  const points = data?.[0]?.result as bigint | undefined;
  const airdropClaimedWei = data?.[1]?.result as bigint | undefined;
  const onChainAirdropToken = data?.[2]?.result as `0x${string}` | undefined;

  const tokenAddress = useMemo(() => {
    if (isAirdropTokenConfigured) return APP_TOKEN_ADDRESS;
    if (
      onChainAirdropToken &&
      onChainAirdropToken !== "0x0000000000000000000000000000000000000000"
    ) {
      return onChainAirdropToken;
    }
    return undefined;
  }, [onChainAirdropToken]);

  const { data: tokenBalanceWei, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: appTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: DEPLOY_CHAIN_ID,
    query: {
      enabled: enabled && Boolean(address) && Boolean(tokenAddress),
    },
  });

  const airdropConfigured = Boolean(tokenAddress);

  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claim = useCallback(
    (pointsToSpend: bigint) => {
      writeContract({
        address: HUB_CONTRACT_ADDRESS,
        abi: hubAbi,
        functionName: "claimAirdrop",
        args: [pointsToSpend],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [writeContract],
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await Promise.all([refetchHub(), refetchBalance()]);
  }, [enabled, refetchHub, refetchBalance]);

  const tokenBalance = formatUnits(
    (tokenBalanceWei as bigint | undefined) ?? BigInt(0),
    18,
  );
  const totalClaimed = formatUnits(airdropClaimedWei ?? BigInt(0), 18);

  if (isPreviewMode() && preview) {
    return {
      points: preview.points,
      airdropConfigured: true,
      tokenBalance: formatUnits(preview.airdropClaimed, 18),
      totalClaimed: formatUnits(preview.airdropClaimed, 18),
      claim: (pointsToSpend: bigint) => preview.previewClaimAirdrop(pointsToSpend),
      refresh: async () => {},
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      writeError: null,
      reset: () => {},
      minPoints: AIRDROP_MIN_POINTS,
      pointsPerToken: POINTS_PER_A_TOKEN,
    };
  }

  return {
    points,
    airdropConfigured,
    tokenBalance,
    totalClaimed,
    claim,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
    minPoints: AIRDROP_MIN_POINTS,
    pointsPerToken: POINTS_PER_A_TOKEN,
  };
}
