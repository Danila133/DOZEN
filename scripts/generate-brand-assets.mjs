/**
 * Regenerate brand assets from public/*.svg
 * Spore Grove — keep in sync with src/config/theme.ts
 *
 * Usage: npm run brand
 */
import { copyFileSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

/** Farcaster / Base app thumbnail — 1.91:1 (1200÷628 ≈ 1.91) */
const THUMB_WIDTH = 1200;
const THUMB_HEIGHT = 628;
const THUMB_MAX_BYTES = 1024 * 1024;

const iconSvg = readFileSync(join(publicDir, "icon.svg"));
const thumbSvg = readFileSync(join(publicDir, "app-thumbnail.svg"));

/** Square icons — 1:1 */
const iconPng = sharp(iconSvg).resize(512, 512, {
  fit: "contain",
  background: "#0c1202",
});

await iconPng.clone().png({ compressionLevel: 9 }).toFile(join(publicDir, "icon.png"));
await iconPng.clone().png({ compressionLevel: 9 }).toFile(join(publicDir, "splash.png"));
await iconPng
  .clone()
  .resize(192, 192)
  .png({ compressionLevel: 9 })
  .toFile(join(publicDir, "icon-192.png"));
await sharp(iconSvg)
  .resize(180, 180, { fit: "contain", background: "#0c1202" })
  .png({ compressionLevel: 9 })
  .toFile(join(publicDir, "apple-touch-icon.png"));
await sharp(iconSvg)
  .resize(32, 32, { fit: "contain", background: "#0c1202" })
  .png({ compressionLevel: 9 })
  .toFile(join(publicDir, "favicon.png"));

/** Wide thumbnail — 1.91:1, max 1 MB */
const thumbOut = join(publicDir, "app-thumbnail.png");
await sharp(thumbSvg)
  .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "fill" })
  .png({ compressionLevel: 9, palette: true })
  .toFile(thumbOut);

const thumbSize = statSync(thumbOut).size;
const thumbMb = (thumbSize / THUMB_MAX_BYTES).toFixed(2);

/** Legacy alias (same file as app-thumbnail) */
await sharp(thumbOut).toFile(join(publicDir, "image.png"));

copyFileSync(
  join(publicDir, "app-thumbnail.svg"),
  join(publicDir, "og.svg"),
);

console.log("Generated (Spore Grove / DOZEN):");
console.log("  icon.png, splash.png, icon-192.png, apple-touch-icon.png, favicon.png (1:1)");
console.log(
  `  app-thumbnail.png ${THUMB_WIDTH}x${THUMB_HEIGHT} (1.91:1) — ${thumbSize} bytes (${thumbMb} MB max)`,
);
console.log("  image.png (alias → app-thumbnail)");

if (thumbSize > THUMB_MAX_BYTES) {
  console.warn(
    `WARN: app-thumbnail.png is ${thumbSize} bytes (>1 MB). Re-run after simplifying SVG or lower width.`,
  );
  process.exit(1);
}
