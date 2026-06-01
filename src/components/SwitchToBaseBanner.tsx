"use client";

import { useEffect, useRef } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { base } from "viem/chains";

import { APP_NAME } from "@/config/app";
import { DEPLOY_CHAIN_ID } from "@/config/contract";

const BASE_LABEL = "Base";

type SwitchToBaseBannerProps = {
  /** Try wallet switch once when wrong network is detected */
  autoSwitch?: boolean;
  className?: string;
};

export function useWrongNetwork() {
  const { isConnected, chain, chainId } = useAccount();

  // Unsupported chains: wagmi leaves `chain` undefined while still connected.
  const wrongNetwork = isConnected && chain?.id !== DEPLOY_CHAIN_ID;

  const networkLabel =
    chain?.name ??
    (chainId != null ? `Chain ${chainId}` : "Unsupported network");

  return {
    wrongNetwork,
    wrongChain: wrongNetwork,
    networkLabel,
    isConnected,
  };
}

export function SwitchToBaseBanner({
  autoSwitch = false,
  className = "",
}: SwitchToBaseBannerProps) {
  const { wrongNetwork, networkLabel } = useWrongNetwork();
  const { switchChain, isPending, error } = useSwitchChain();
  const autoAttempted = useRef(false);

  useEffect(() => {
    autoAttempted.current = false;
  }, [wrongNetwork]);

  useEffect(() => {
    if (!autoSwitch || !wrongNetwork || autoAttempted.current) return;
    autoAttempted.current = true;
    switchChain({ chainId: DEPLOY_CHAIN_ID });
  }, [autoSwitch, wrongNetwork, switchChain]);

  if (!wrongNetwork) return null;

  const switchError =
    error?.message.split("\n")[0] ??
    (error ? "Could not switch network in wallet" : null);

  return (
    <div
      className={`uni-card uni-card-warning flex flex-col gap-3 px-4 py-4 ${className}`.trim()}
      role="alert"
    >
      <div>
        <p className="uni-label text-[var(--uni-critical)]">Wrong network</p>
        <p className="uni-body mt-1 text-sm">
          Connected to <span className="uni-mono font-medium">{networkLabel}</span>
          . {APP_NAME} requires <span className="uni-text-accent">{BASE_LABEL}</span>{" "}
          mainnet (chain ID {base.id}).
        </p>
      </div>
      <button
        type="button"
        className="uni-btn uni-btn-primary w-full"
        disabled={isPending}
        onClick={() => switchChain({ chainId: DEPLOY_CHAIN_ID })}
      >
        {isPending ? "Confirm in wallet…" : `Switch to ${BASE_LABEL}`}
      </button>
      {switchError && (
        <p className="uni-caption text-center text-[var(--uni-critical)]">
          {switchError}
        </p>
      )}
    </div>
  );
}
