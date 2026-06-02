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

/** Domain verified at https://farcaster.xyz/~/developers/mini-apps/manifest */
export const FARCASTER_ACCOUNT_ASSOCIATION: {
  header: string;
  payload: string;
  signature: string;
} = {
  header:
    "eyJmaWQiOjc4MDQ5MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweEE5MmZmOEIwQ0UwZkZERjI3MDkzMjJmMzRDMTkxM0MyRkJDOTgxMjQifQ",
  payload: "eyJkb21haW4iOiJkb3plbi10YXUudmVyY2VsLmFwcCJ9",
  signature:
    "TlvRRr09HE/K0kHfhJ/6mW++hj8TjmJdF500J5H/ZM06eFtdzDoHjq3Mxs9j2RNopqzfia6yuRbK6fFErJfxbxw=",
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
