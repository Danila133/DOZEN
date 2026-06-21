"use client";

import { useCallback, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  HUB_CONTRACT_ADDRESS,
  hubAbi,
  isContractConfigured,
} from "@/config/contract";
import { useBuilderWriteContract } from "@/hooks/useBuilderWriteContract";
import { isPreviewMode } from "@/config/preview";
import { usePreviewHubStats } from "@/context/PreviewStateContext";
import {
  isValidReferralCodeFormat,
  normalizeReferralCodeInput,
  referralCodeFromAddress,
} from "@/lib/referralCode";

export function useReferralCode() {
  const preview = usePreviewHubStats();
  const { address, isConnected } = useAccount();
  const [friendCodeInput, setFriendCodeInput] = useState("");
  const [previewRegisterOk, setPreviewRegisterOk] = useState(false);
  const [previewRedeemOk, setPreviewRedeemOk] = useState(false);

  const enabled =
    isContractConfigured && isConnected && !!address && !isPreviewMode();

  const myCode = useMemo(
    () => (address ? referralCodeFromAddress(address) : ""),
    [address],
  );

  const { data: codeHash, refetch: refetchCodeHash } = useReadContract({
    address: HUB_CONTRACT_ADDRESS,
    abi: hubAbi,
    functionName: "userReferralCodeHash",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const { data: hasRedeemed, refetch: refetchRedeemed } = useReadContract({
    address: HUB_CONTRACT_ADDRESS,
    abi: hubAbi,
    functionName: "hasRedeemedReferralCode",
    args: address ? [address] : undefined,
    query: { enabled },
  });

  const isCodeRegistered =
    codeHash != null &&
    codeHash !==
      "0x0000000000000000000000000000000000000000000000000000000000000000";

  const normalizedFriendCode = normalizeReferralCodeInput(friendCodeInput);
  const canRedeemFriendCode =
    enabled &&
    !hasRedeemed &&
    isValidReferralCodeFormat(normalizedFriendCode) &&
    normalizedFriendCode !== myCode;

  const {
    writeContract: writeRegister,
    data: registerHash,
    reset: resetRegister,
    error: registerError,
    isPending: isRegisterPending,
  } = useBuilderWriteContract();

  const {
    writeContract: writeRedeem,
    data: redeemHash,
    reset: resetRedeem,
    error: redeemError,
    isPending: isRedeemPending,
  } = useBuilderWriteContract();

  const { isLoading: isRegisterConfirming, isSuccess: registerSuccess } =
    useWaitForTransactionReceipt({ hash: registerHash });

  const { isLoading: isRedeemConfirming, isSuccess: redeemSuccess } =
    useWaitForTransactionReceipt({ hash: redeemHash });

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await Promise.all([refetchCodeHash(), refetchRedeemed()]);
  }, [enabled, refetchCodeHash, refetchRedeemed]);

  const registerMyCode = useCallback(() => {
    if (!enabled || isCodeRegistered) return;
    resetRegister();
    writeRegister({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "registerReferralCode",
    });
  }, [enabled, isCodeRegistered, resetRegister, writeRegister]);

  const redeemFriendCode = useCallback(() => {
    if (!canRedeemFriendCode) return;
    resetRedeem();
    writeRedeem({
      address: HUB_CONTRACT_ADDRESS,
      abi: hubAbi,
      functionName: "redeemReferralCode",
      args: [normalizedFriendCode],
    });
  }, [canRedeemFriendCode, normalizedFriendCode, resetRedeem, writeRedeem]);

  const chain = {
    myCode,
    isCodeRegistered,
    hasRedeemed: !!hasRedeemed,
    friendCodeInput,
    setFriendCodeInput,
    normalizedFriendCode,
    canRedeemFriendCode,
    registerMyCode,
    redeemFriendCode,
    isRegistering: isRegisterPending || isRegisterConfirming,
    isRedeeming: isRedeemPending || isRedeemConfirming,
    registerSuccess,
    redeemSuccess,
    registerError,
    redeemError,
    refresh,
  };

  if (isPreviewMode() && preview && isConnected && address) {
    const normalized = normalizeReferralCodeInput(friendCodeInput);
    return {
      myCode,
      isCodeRegistered: preview.isCodeRegistered,
      hasRedeemed: preview.hasRedeemed,
      friendCodeInput,
      setFriendCodeInput,
      normalizedFriendCode: normalized,
      canRedeemFriendCode:
        !preview.hasRedeemed &&
        isValidReferralCodeFormat(normalized) &&
        normalized !== myCode,
      registerMyCode: () => {
        preview.previewRegisterCode();
        setPreviewRegisterOk(true);
      },
      redeemFriendCode: () => {
        preview.previewRedeemCode();
        setPreviewRedeemOk(true);
      },
      isRegistering: false,
      isRedeeming: false,
      registerSuccess: previewRegisterOk,
      redeemSuccess: previewRedeemOk,
      registerError: null,
      redeemError: null,
      refresh: async () => {},
    };
  }

  return chain;
}
