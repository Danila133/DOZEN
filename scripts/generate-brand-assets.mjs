/**
 * Regenerate raster brand assets from public/icon.svg + public/og.svg.
 * Spore Grove palette — keep in sync with src/config/theme.ts
 *
 * Usage: npm run brand
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

const iconSvg = readFileSync(join(publicDir, "icon.svg"));
const ogSvg = readFileSync(join(publicDir, "og.svg"));

/** Safe zone for maskable / store icons */
const iconPng = sharp(iconSvg).resize(512, 512, { fit: "contain", background: "#0c1202" });

await iconPng.clone().png().toFile(join(publicDir, "icon.png"));
await iconPng.clone().png().toFile(join(publicDir, "splash.png"));
await iconPng
  .clone()
  .resize(192, 192)
  .png()
  .toFile(join(publicDir, "icon-192.png"));
await sharp(iconSvg).resize(180, 180, { fit: "contain", background: "#0c1202" }).png().toFile(join(publicDir, "apple-touch-icon.png"));
await sharp(iconSvg).resize(32, 32, { fit: "contain", background: "#0c1202" }).png().toFile(join(publicDir, "favicon.png"));

const ogPng = sharp(ogSvg).resize(1200, 628, { fit: "fill" });
await ogPng.clone().png().toFile(join(publicDir, "image.png"));
await ogPng.clone().png().toFile(join(publicDir, "app-thumbnail.png"));

console.log("Generated (Spore Grove / DOZEN):");
console.log("  icon.png, splash.png, icon-192.png, apple-touch-icon.png, favicon.png");
console.log("  image.png, app-thumbnail.png");
