import {
  APP_NAME,
  FARCASTER_DESCRIPTION,
  FARCASTER_SUBTITLE,
} from "@/config/app";
import {
  CANONICAL_SITE_URL,
  getAppHeroUrl,
  getAppIconUrl,
  getAppImageUrl,
  getAppSplashUrl,
} from "@/config/appAssets";

/** Fill after domain verification at https://farcaster.xyz/~/developers/mini-apps/manifest */
export const FARCASTER_ACCOUNT_ASSOCIATION: {
  header: string;
  payload: string;
  signature: string;
} = {
  header: "",
  payload: "",
  signature: "",
};

export const FARCASTER_BUTTON_TITLE = "Open app";
export const FARCASTER_SPLASH_BACKGROUND_COLOR = "#0c1202";

function buildMiniappMetadata(origin: string) {
  return {
    version: "1",
    name: APP_NAME,
    homeUrl: origin,
    iconUrl: getAppIconUrl(origin),
    imageUrl: getAppImageUrl(origin),
    heroImageUrl: getAppHeroUrl(origin),
    buttonTitle: FARCASTER_BUTTON_TITLE,
    splashImageUrl: getAppSplashUrl(origin),
    splashBackgroundColor: FARCASTER_SPLASH_BACKGROUND_COLOR,
    webhookUrl: `${origin}/api/webhook`,
    description: FARCASTER_DESCRIPTION,
    subtitle: FARCASTER_SUBTITLE,
    primaryCategory: "social",
    tags: ["base", "miniapp"],
    noindex: true,
  } as const;
}

export function buildFarcasterManifest() {
  const origin = CANONICAL_SITE_URL.replace(/\/$/, "");
  const association = FARCASTER_ACCOUNT_ASSOCIATION;
  const hasAssociation =
    association.header && association.payload && association.signature;

  return {
    ...(hasAssociation ? { accountAssociation: association } : {}),
    frame: buildMiniappMetadata(origin),
    miniapp: buildMiniappMetadata(origin),
  };
}
