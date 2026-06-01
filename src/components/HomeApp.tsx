"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";

import { APP_NAME, APP_TAGLINE, TOKEN_SYMBOL } from "@/config/app";
import { AppNav } from "@/components/AppNav";
import { PreviewBanner } from "@/components/PreviewBanner";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useWrongNetwork } from "@/components/SwitchToBaseBanner";
import { DeployPanel } from "@/components/DeployPanel";
import { GmPanel } from "@/components/GmPanel";
import { PointsRulesCard } from "@/components/PointsRulesCard";
import { BOOST_GM_MULTIPLIER } from "@/config/contract";
import { POINTS_PER_REFERRAL } from "@/config/referral";
import {
  isBadgeReadyForUi,
  isHubLiveMode,
  isHubReadyForUi,
} from "@/config/preview";
import { useFarcasterMiniApp } from "@/hooks/useFarcasterMiniApp";
import { useHubStats } from "@/hooks/useHubStats";

type PlayTab = "gm" | "deploy";

const PLAY_TABS = new Set<PlayTab>(["gm", "deploy"]);

export function HomeApp() {
  const { inMiniApp } = useFarcasterMiniApp();
  const searchParams = useSearchParams();
  const [playTab, setPlayTab] = useState<PlayTab>("gm");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && PLAY_TABS.has(tabParam as PlayTab)) {
      setPlayTab(tabParam as PlayTab);
    }
  }, [searchParams]);

  const { isConnected } = useAccount();
  const { wrongChain } = useWrongNetwork();

  const {
    deployCount,
    freeDeployAvailable,
    deployFeeOnChain,
    points,
    boostActive,
    refreshStats,
  } = useHubStats();

  const hubReady = isHubReadyForUi();
  const canAct = isHubLiveMode({ isConnected, wrongChain });

  return (
    <>
      <AppNav />
      <PreviewBanner />

      <header className="uni-card px-5 py-5 text-center">
        <p className="uni-eyebrow">
          {inMiniApp ? "Farcaster" : "Web"} · Base
        </p>
        <h1 className="uni-title mt-2 text-3xl">{APP_NAME}</h1>
        <p className="uni-body mt-2 text-sm">{APP_TAGLINE}</p>
      </header>

      {!hubReady && (
        <div className="uni-card uni-card-critical px-4 py-4">
          <p className="uni-label text-[var(--uni-critical)]">Hub not configured</p>
          <p className="uni-caption mt-2">
            Deploy <span className="uni-code">Hub.sol</span> and set{" "}
            <span className="uni-code">HUB_CONTRACT_ADDRESS</span> in{" "}
            <span className="uni-code">src/config/contract.ts</span>.
          </p>
        </div>
      )}

      <div className="uni-card px-4 py-5">
        <ConnectWallet />
        {hubReady && isConnected && !wrongChain && (
          <div className="uni-card-inset mt-2.5 flex items-center justify-between gap-2 px-3 py-2">
            <p className="uni-label shrink-0 leading-none">Total points</p>
            <p className="uni-mono text-lg font-semibold leading-none uni-text-accent">
              {points?.toString() ?? "0"}
            </p>
          </div>
        )}
      </div>

      {hubReady && isConnected && !wrongChain && (
        <div className="uni-card p-4">
          <div className="uni-tabs mb-4">
            <div className="uni-tab-wrap">
              <button
                type="button"
                className={`uni-tab ${playTab === "gm" ? "uni-tab-active" : ""}`}
                onClick={() => setPlayTab("gm")}
              >
                GM
              </button>
              {boostActive && (
                <span className="uni-tab-2x-badge" aria-hidden>
                  {BOOST_GM_MULTIPLIER}×
                </span>
              )}
            </div>
            <div className="uni-tab-wrap">
              <button
                type="button"
                className={`uni-tab ${playTab === "deploy" ? "uni-tab-active" : ""}`}
                onClick={() => setPlayTab("deploy")}
              >
                Deploy
              </button>
              {boostActive && (
                <span className="uni-tab-2x-badge" aria-hidden>
                  {BOOST_GM_MULTIPLIER}×
                </span>
              )}
            </div>
          </div>

          {playTab === "gm" ? (
            <GmPanel disabled={!canAct} />
          ) : (
            <DeployPanel
              disabled={!canAct}
              freeDeployAvailable={freeDeployAvailable}
              deployFeeOnChain={deployFeeOnChain}
              onSuccess={() => void refreshStats()}
            />
          )}
        </div>
      )}

      {hubReady && <PointsRulesCard />}

      {isBadgeReadyForUi() && (
        <Link href="/badges" className="uni-btn uni-btn-secondary block text-center">
          View badges · GM &amp; Deploy milestones
        </Link>
      )}

      {hubReady && (
        <Link href="/referral" className="uni-btn uni-btn-secondary block text-center">
          Referral · +{POINTS_PER_REFERRAL} pts
        </Link>
      )}

      {hubReady && (
        <Link href="/leaderboard" className="uni-btn uni-btn-secondary block text-center">
          Leaderboard
        </Link>
      )}

      {!isBadgeReadyForUi() && hubReady && (
        <p className="uni-caption text-center">
          Deploy <span className="uni-code">BadgeNFT.sol</span> and set{" "}
          <span className="uni-code">BADGE_NFT_ADDRESS</span> for NFT badges.
        </p>
      )}

      {hubReady && isConnected && !wrongChain && (
        <p className="uni-caption text-center">
          Deploys: <span className="uni-mono">{deployCount?.toString() ?? "0"}</span>
          {" · "}
          Earn <span className="uni-text-accent font-semibold">{TOKEN_SYMBOL}</span> after
          token deploy
        </p>
      )}
    </>
  );
}
