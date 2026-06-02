import { APP_NAME } from "@/config/app";
import {
  APP_THUMBNAIL_PATH,
  CANONICAL_SITE_URL,
  getAppSplashUrl,
} from "@/config/appAssets";
import {
  FARCASTER_BUTTON_TITLE,
  FARCASTER_SPLASH_BACKGROUND_COLOR,
} from "@/config/manifest";

export const FARCASTER_APP_NAME = APP_NAME;

/** Production mini app URL (local dev still uses localhost via env) */
export const FARCASTER_MINIAPP_URL = "https://dozen-tau.vercel.app";

export function getSiteUrl() {
  return CANONICAL_SITE_URL;
}

export function buildFcMiniAppEmbed(siteUrl: string = CANONICAL_SITE_URL) {
  const origin = siteUrl.replace(/\/$/, "");

  return {
    version: "1",
    imageUrl: `${CANONICAL_SITE_URL}${APP_THUMBNAIL_PATH}`,
    button: {
      title: FARCASTER_BUTTON_TITLE,
      action: {
        type: "launch_miniapp",
        name: FARCASTER_APP_NAME,
        url: origin,
        splashImageUrl: getAppSplashUrl(CANONICAL_SITE_URL),
        splashBackgroundColor: FARCASTER_SPLASH_BACKGROUND_COLOR,
      },
    },
  };
}
