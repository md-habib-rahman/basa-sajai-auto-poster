import sharp from "sharp";
import path from "path";

const FONT = path.join(process.cwd(), "assets/fonts/NotoSansBengali-Bold.ttf");
const SIZE = 1080;

// Bengali needs real text shaping (conjuncts, pre-base vowels). sharp's Pango/HarfBuzz
// text renderer does this correctly; resvg/satori mangled the glyphs in testing.
async function bengaliText(text: string, px: number, width: number, opacity = 1) {
  const buf = await sharp({
    text: {
      text: `<span foreground="white" alpha="${Math.round(opacity * 65535)}">${text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")}</span>`,
      font: `Noto Sans Bengali Bold ${px}`,
      fontfile: FONT,
      width,
      align: "center",
      wrap: "word",
      rgba: true,
    },
  })
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, w: meta.width!, h: meta.height! };
}

export async function addHeadline(base: Buffer, headline: string, brand = "বাসা সাজাই") {
  const head = await bengaliText(headline, 62, 900);
  const tag = await bengaliText(brand, 32, 600, 0.9);

  const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">
    <defs>
      <linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
      <linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient>
    </defs>
    <rect width="${SIZE}" height="${head.h + 190}" fill="url(#t)"/>
    <rect y="${SIZE - 150}" width="${SIZE}" height="150" fill="url(#b)"/>
  </svg>`);

  return sharp(base)
    .resize(SIZE, SIZE, { fit: "cover" })
    .composite([
      { input: shade },
      { input: head.buf, left: Math.round((SIZE - head.w) / 2), top: 80 },
      { input: tag.buf, left: Math.round((SIZE - tag.w) / 2), top: SIZE - tag.h - 36 },
    ])
    .jpeg({ quality: 90 })
    .toBuffer();
}
