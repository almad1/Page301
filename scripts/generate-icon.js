#!/usr/bin/env node
// Generates teletext-style app icons for Page301.
// Run: node scripts/generate-icon.js

const { Jimp } = require('jimp');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

// Teletext palette
const BLACK  = 0x000000ff;
const BLUE   = 0x0000CCff;
const CYAN   = 0x00FFFFff;
const GREEN  = 0x00FF00ff;
const YELLOW = 0xFFFF00ff;
const WHITE  = 0xFFFFFFff;

function fillRect(img, x, y, w, h, color) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const px = x + dx, py = y + dy;
      if (px >= 0 && py >= 0 && px < img.bitmap.width && py < img.bitmap.height) {
        img.setPixelColor(color, px, py);
      }
    }
  }
}

// Draw a 5×7 pixel-art digit/letter scaled by `scale`
// Each character is defined on a 5-wide × 7-tall grid (1 = filled)
const GLYPHS = {
  'P': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
  ],
  '3': [
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ],
};

function drawGlyph(img, char, x, y, scale, color) {
  const rows = GLYPHS[char];
  if (!rows) return;
  rows.forEach((row, ry) => {
    row.forEach((on, rx) => {
      if (on) fillRect(img, x + rx * scale, y + ry * scale, scale, scale, color);
    });
  });
}

async function generateIcon(size) {
  const img = new Jimp({ width: size, height: size, color: BLACK });

  const glyphW = 5;
  const glyphH = 7;
  const gap = 1;           // cells between characters
  const chars = ['P', '3', '0', '1'];
  const totalCells = chars.length * glyphW + (chars.length - 1) * gap;

  // Scale so the text fills ~55% of the icon width
  const scale = Math.floor(size * 0.55 / totalCells);
  const textW = totalCells * scale;
  const textH = glyphH * scale;

  // ── Layout ──────────────────────────────────────────────────
  const bannerTop    = Math.floor(size * 0.28);
  const bannerH      = Math.floor(size * 0.44);
  const bannerBot    = bannerTop + bannerH;
  const dividerH     = Math.max(3, Math.floor(size * 0.012));
  const topBarH      = Math.max(3, Math.floor(size * 0.012));
  const padding      = Math.floor(size * 0.05);

  // Black background (default)

  // Green top strip
  fillRect(img, 0, 0, size, topBarH, GREEN);

  // Cyan divider just below top strip
  fillRect(img, 0, topBarH, size, dividerH, CYAN);

  // Green strip + cyan divider at bottom
  fillRect(img, 0, size - topBarH, size, topBarH, GREEN);
  fillRect(img, 0, size - topBarH - dividerH, size, dividerH, CYAN);

  // Blue banner
  fillRect(img, 0, bannerTop, size, bannerH, BLUE);

  // Cyan border lines on banner
  fillRect(img, 0, bannerTop,          size, dividerH, CYAN);
  fillRect(img, 0, bannerBot - dividerH, size, dividerH, CYAN);

  // Yellow "P301" centred in the banner
  const textX = Math.floor((size - textW) / 2);
  const textY = Math.floor(bannerTop + (bannerH - textH) / 2);

  chars.forEach((ch, i) => {
    const cx = textX + i * (glyphW + gap) * scale;
    drawGlyph(img, ch, cx, textY, scale, YELLOW);
  });

  // Small green "PAGE" label above the blue banner
  const labelScale = Math.max(1, Math.floor(scale * 0.45));
  const labelChars = ['P'];   // keep it minimal at small scales
  const labelW = glyphW * labelScale;
  const labelH = glyphH * labelScale;
  const labelX = Math.floor((size - labelW) / 2);
  const labelY = bannerTop - labelH - padding;
  if (labelY > topBarH + dividerH + 2) {
    drawGlyph(img, 'P', labelX, labelY, labelScale, GREEN);
  }

  return img;
}

async function main() {
  console.log('Generating icons…');

  // Main icon (1024×1024) — used for iOS, web, and as the base
  const icon = await generateIcon(1024);
  await icon.write(path.join(ASSETS, 'icon.png'));
  console.log('  icon.png ✓');

  // Android adaptive foreground (1024×1024, safe zone ~66% = 680px)
  await icon.write(path.join(ASSETS, 'android-icon-foreground.png'));
  console.log('  android-icon-foreground.png ✓');

  // Android adaptive background — solid black
  const bg = new Jimp({ width: 1024, height: 1024, color: BLACK });
  await bg.write(path.join(ASSETS, 'android-icon-background.png'));
  console.log('  android-icon-background.png ✓');

  // Monochrome — same design but white on black
  const mono = await generateIcon(1024);
  // Replace yellow/cyan/green with white, blue with dark grey
  mono.scan(0, 0, 1024, 1024, (x, y, idx) => {
    const c = mono.getPixelColor(x, y);
    if (c === YELLOW || c === CYAN || c === GREEN) {
      mono.setPixelColor(WHITE, x, y);
    } else if (c === BLUE) {
      mono.setPixelColor(0x333333ff, x, y);
    }
  });
  await mono.write(path.join(ASSETS, 'android-icon-monochrome.png'));
  console.log('  android-icon-monochrome.png ✓');

  // Splash icon (200×200 centred on transparent — Expo splash-icon)
  const splash = await generateIcon(512);
  await splash.write(path.join(ASSETS, 'splash-icon.png'));
  console.log('  splash-icon.png ✓');

  console.log('Done.');
}

main().catch(console.error);
