"use client";

import { useCallback, useState } from "react";
import { encodeFunctionData, type Abi } from "viem";
import {
  useAccount,
  useSendCalls,
  useWaitForCallsStatus,
  useWriteContract,
} from "wagmi";

import {
  BUILDER_CALLS_CAPABILITIES,
  BUILDER_DATA_SUFFIX,
} from "@/config/builder";
import { DEPLOY_CHAIN_ID } from "@/config/contract";

type BuilderWriteParams = {
  address: `0x${string}`;
  abi: Abi | readonly unknown[];
  functionName: string;
  args?: readonly unknown[];
  chainId?: typeof DEPLOY_CHAIN_ID;
  value?: bigint;
};

function preferSendCalls(connectorId?: string) {
  return Boolean(connectorId && connectorId !== "farcaster");
}

/** Browser wallets need wallet_sendCalls + dataSuffix; mini app uses writeContract */
export function useBuilderWriteContract() {
  const { connector } = useAccount();
  const [callsId, setCallsId] = useState<string | undefined>();

  const write = useWriteContract();
  const send = useSendCalls();

  const callsStatus = useWaitForCallsStatus({
    id: callsId,
    query: { enabled: Boolean(callsId) },
  });

  const callsHash =
    callsStatus.data?.status === "success"
      ? callsStatus.data.receipts?.[0]?.transactionHash
      : undefined;

  const hash = write.data ?? callsHash;
  const awaitingCallsHash = Boolean(
    callsId && !callsHash && callsStatus.data?.status !== "failure",
  );
  const isPending = write.isPending || send.isPending || awaitingCallsHash;
  const error = write.error ?? send.error ?? callsStatus.error;

  const reset = useCallback(() => {
    write.reset();
    send.reset();
    setCallsId(undefined);
  }, [send, write]);

  const writeWithSuffix = useCallback(
    (params: BuilderWriteParams) => {
      write.writeContract({
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
        chainId: params.chainId ?? DEPLOY_CHAIN_ID,
        ...(params.value !== undefined ? { value: params.value } : {}),
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof write.writeContract>[0]);
    },
    [write],
  );

  const writeContract = useCallback(
    (params: BuilderWriteParams) => {
      reset();
      const chainId = params.chainId ?? DEPLOY_CHAIN_ID;

      if (!preferSendCalls(connector?.id)) {
        writeWithSuffix(params);
        return;
      }

      const data = encodeFunctionData({
        abi: params.abi as Abi,
        functionName: params.functionName,
        args: params.args ?? [],
      });

      send.mutate(
        {
          calls: [
            {
              to: params.address,
              data,
              value: params.value ?? BigInt(0),
            },
          ],
          chainId,
          capabilities: BUILDER_CALLS_CAPABILITIES,
        },
        {
          onSuccess: (result) => setCallsId(result.id),
          onError: () => writeWithSuffix(params),
        },
      );
    },
    [connector?.id, reset, send, writeWithSuffix],
  );

  const writeContractAsync = useCallback(
    async (params: BuilderWriteParams) => {
      reset();
      return write.writeContractAsync({
        address: params.address,
        abi: params.abi,
        functionName: params.functionName,
        args: params.args,
        chainId: params.chainId ?? DEPLOY_CHAIN_ID,
        ...(params.value !== undefined ? { value: params.value } : {}),
        dataSuffix: BUILDER_DATA_SUFFIX,
      } as Parameters<typeof write.writeContractAsync>[0]);
    },
    [reset, write],
  );

  return {
    writeContract,
    writeContractAsync,
    data: hash,
    isPending,
    error,
    reset,
  };
}
