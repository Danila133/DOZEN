"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

import { AppNav } from "@/components/AppNav";
import {
  FarmProgressSection,
  FarmRankCard,
  type FarmTab,
} from "@/components/FarmProgressSection";
import { PreviewBanner } from "@/components/PreviewBanner";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useWrongNetwork } from "@/components/SwitchToBaseBanner";
import { APP_NAME, TOKEN_SYMBOL } from "@/config/app";
import { isHubReadyForUi, isHubLiveMode } from "@/config/preview";
import { useFarmProgress } from "@/hooks/useFarmProgress";
import { useHubStats } from "@/hooks/useHubStats";

export function FarmApp() {
  const [tab, setTab] = useState<FarmTab>("today");
  const { isConnected } = useAccount();
  const { wrongChain } = useWrongNetwork();

  const { pointsNum, refresh } = useFarmProgress();
  const { refreshStats } = useHubStats();

  const hubReady = isHubReadyForUi();
  const canAct = isHubLiveMode({ isConnected, wrongChain });

  return (
    <>
      <AppNav />
      <PreviewBanner />

      <header className="uni-card px-5 py-5 text-center">
        <h1 className="uni-title text-2xl">
          Farm <span className="uni-text-accent">{TOKEN_SYMBOL}</span>
        </h1>
        <p className="uni-body mt-2 text-sm">
          Daily checklist &amp; rank — {APP_NAME}
        </p>
      </header>

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
      </div>

      {hubReady && (
        <>
          <FarmRankCard
            pointsNum={pointsNum}
            boostDisabled={!canAct}
            onBoostSuccess={() => void Promise.all([refresh(), refreshStats()])}
          />
          <FarmProgressSection
            showFarm
            tab={tab}
            onTabChange={setTab}
          />
        </>
      )}
    </>
  );
}
