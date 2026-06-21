"use client";

import { useCallback, useMemo } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContracts,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatUnits, maxUint256, parseUnits } from "viem";

import {
  APP_TOKEN_ADDRESS,
  appTokenAbi,
  isAirdropTokenConfigured,
} from "@/config/airdropContract";
import { DEPLOY_CHAIN_ID } from "@/config/contract";
import { useBuilderWriteContract } from "@/hooks/useBuilderWriteContract";
import { MIN_STAKE_WEI } from "@/config/staking";
import {
  STAKE_POOL_ADDRESS,
  isStakePoolConfigured,
  stakePoolAbi,
} from "@/config/stakingContract";
import { isPreviewMode } from "@/config/preview";
import { usePreviewHubStats } from "@/context/PreviewStateContext";

export function useStaking() {
  const preview = usePreviewHubStats();
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: DEPLOY_CHAIN_ID });
  const enabled =
    Boolean(address) &&
    isStakePoolConfigured &&
    isAirdropTokenConfigured &&
    !isPreviewMode();

  const contracts = useMemo(() => {
    if (!address) return [];
    return [
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "stakedBalance" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "earned" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "totalStaked" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "rewardReserve" as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: APP_TOKEN_ADDRESS,
        abi: appTokenAbi,
        functionName: "balanceOf" as const,
        args: [address] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
      {
        address: APP_TOKEN_ADDRESS,
        abi: appTokenAbi,
        functionName: "allowance" as const,
        args: [address, STAKE_POOL_ADDRESS] as const,
        chainId: DEPLOY_CHAIN_ID,
      },
    ];
  }, [address]);

  const { data, refetch } = useReadContracts({
    contracts,
    query: { enabled, staleTime: 0 },
  });

  const stakedWei = data?.[0]?.result as bigint | undefined;
  const earnedWei = data?.[1]?.result as bigint | undefined;
  const totalStakedWei = data?.[2]?.result as bigint | undefined;
  const rewardReserveWei = data?.[3]?.result as bigint | undefined;
  const walletBalanceWei = data?.[4]?.result as bigint | undefined;
  const allowanceWei = data?.[5]?.result as bigint | undefined;

  const {
    data: hash,
    isPending,
    writeContractAsync,
    error: writeError,
    reset,
  } = useBuilderWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await refetch();
  }, [enabled, refetch]);

  const stake = useCallback(
    async (amount: bigint) => {
      if (!address || !publicClient) return;

      const allowance = allowanceWei ?? BigInt(0);
      if (allowance < amount) {
        const approveHash = await writeContractAsync({
          address: APP_TOKEN_ADDRESS,
          abi: appTokenAbi,
          functionName: "approve",
          args: [STAKE_POOL_ADDRESS, maxUint256],
          chainId: DEPLOY_CHAIN_ID,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      await writeContractAsync({
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "stake",
        args: [amount],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [address, allowanceWei, publicClient, writeContractAsync],
  );

  const unstake = useCallback(
    async (amount: bigint) => {
      await writeContractAsync({
        address: STAKE_POOL_ADDRESS,
        abi: stakePoolAbi,
        functionName: "unstake",
        args: [amount],
        chainId: DEPLOY_CHAIN_ID,
      });
    },
    [writeContractAsync],
  );

  const claimReward = useCallback(async () => {
    await writeContractAsync({
      address: STAKE_POOL_ADDRESS,
      abi: stakePoolAbi,
      functionName: "claimReward",
      chainId: DEPLOY_CHAIN_ID,
    });
  }, [writeContractAsync]);

  const exit = useCallback(async () => {
    await writeContractAsync({
      address: STAKE_POOL_ADDRESS,
      abi: stakePoolAbi,
      functionName: "exit",
      chainId: DEPLOY_CHAIN_ID,
    });
  }, [writeContractAsync]);

  if (isPreviewMode() && preview) {
    return {
      stakingConfigured: true,
      staked: formatUnits(preview.stakedBalance, 18),
      earned: formatUnits(preview.stakeEarned, 18),
      totalStaked: "50000",
      rewardReserve: "12000",
      rewardReserveWei: parseUnits("12000", 18),
      walletBalance: "2500",
      stakedWei: preview.stakedBalance,
      earnedWei: preview.stakeEarned,
      totalStakedWei: parseUnits("50000", 18),
      walletBalanceWei: parseUnits("2500", 18),
      minStakeWei: MIN_STAKE_WEI,
      stake: async (amount: bigint) => preview.previewStake(amount),
      unstake: async (amount: bigint) => preview.previewUnstake(amount),
      claimReward: async () => {},
      exit: async () => preview.previewUnstake(preview.stakedBalance),
      refresh: async () => {},
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      writeError: null,
      reset: () => {},
    };
  }

  return {
    stakingConfigured: isStakePoolConfigured && isAirdropTokenConfigured,
    staked: formatUnits(stakedWei ?? BigInt(0), 18),
    earned: formatUnits(earnedWei ?? BigInt(0), 18),
    totalStaked: formatUnits(totalStakedWei ?? BigInt(0), 18),
    rewardReserve: formatUnits(rewardReserveWei ?? BigInt(0), 18),
    rewardReserveWei: rewardReserveWei ?? BigInt(0),
    walletBalance: formatUnits(walletBalanceWei ?? BigInt(0), 18),
    stakedWei: stakedWei ?? BigInt(0),
    earnedWei: earnedWei ?? BigInt(0),
    totalStakedWei: totalStakedWei ?? BigInt(0),
    walletBalanceWei: walletBalanceWei ?? BigInt(0),
    minStakeWei: MIN_STAKE_WEI,
    stake,
    unstake,
    claimReward,
    exit,
    refresh,
    isPending,
    isConfirming,
    isSuccess,
    writeError,
    reset,
  };
}
