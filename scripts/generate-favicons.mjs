import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const sourceSvgPath = path.join(projectRoot, 'src/assets/favicon-source.svg');
const publicDir = path.join(projectRoot, 'public');

const rawSvg = fs.readFileSync(sourceSvgPath, 'utf8');

// Extract the main <path .../> from favicon-source.svg
const pathMatch = rawSvg.match(/<path\s+[^>]*d="([^"]+)"[^>]*\/>/);
if (!pathMatch) {
  throw new Error('Could not find <path> in src/assets/favicon-source.svg');
}
const pathD = pathMatch[1];

// 1. Clean public/favicon.svg (square 497.04 x 497.04 with ~6.1% margin and dark-mode support)
const cleanFaviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 497.04 497.04">
  <style>path { fill: #111; } @media (prefers-color-scheme: dark) { path { fill: #fff; } }</style>
  <path fill-rule="evenodd" d="${pathD}"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), cleanFaviconSvg, 'utf8');

// Helper to build SVG for raster sizes (with optional stroke boost for 16x16 / 32x32 legibility)
function createRasterSvg({ strokeWidth = 0, viewBoxPadding = 0, bg = null } = {}) {
  const baseSize = 497.04;
  const vbMin = -viewBoxPadding;
  const vbSize = baseSize + viewBoxPadding * 2;
  const bgRect = bg
    ? `<rect x="${vbMin}" y="${vbMin}" width="${vbSize}" height="${vbSize}" fill="${bg}"/>`
    : '';
  const strokeAttrs =
    strokeWidth > 0
      ? ` stroke="#111b19" stroke-width="${strokeWidth}" stroke-linejoin="round"`
      : '';

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbMin} ${vbMin} ${vbSize} ${vbSize}">
      ${bgRect}
      <path fill="#1b1b19" fill-rule="evenodd"${strokeAttrs} d="${pathD}"/>
    </svg>`
  );
}

// Pack multiple PNG buffers into a standard ICO container
function createIcoFromPngs(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6 + count * 16;
  const header = Buffer.alloc(headerSize);

  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type: 1 = ICO
  header.writeUInt16LE(count, 4); // Image count

  let offset = headerSize;
  pngEntries.forEach(({ size, buffer }, idx) => {
    const entryOffset = 6 + idx * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset);     // Width
    header.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // Height
    header.writeUInt8(0, entryOffset + 2);                      // Color palette
    header.writeUInt8(0, entryOffset + 3);                      // Reserved
    header.writeUInt16LE(1, entryOffset + 4);                   // Color planes
    header.writeUInt16LE(32, entryOffset + 6);                  // Bits per pixel
    header.writeUInt32LE(buffer.length, entryOffset + 8);       // Data size
    header.writeUInt32LE(offset, entryOffset + 12);             // Data offset
    offset += buffer.length;
  });

  return Buffer.concat([header, ...pngEntries.map((e) => e.buffer)]);
}

async function run() {
  // 2. favicon-96x96.png
  const png96 = await sharp(createRasterSvg({ strokeWidth: 2 }))
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-96x96.png'), png96);

  // 3. favicon.ico with 16x16 and 32x32 (slightly thickened floor-plan lines for tiny sizes)
  const png16 = await sharp(createRasterSvg({ strokeWidth: 7 }))
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const png32 = await sharp(createRasterSvg({ strokeWidth: 4.5 }))
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const icoBuffer = createIcoFromPngs([
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // 4. apple-touch-icon.png (180x180, solid light background #eceae5 and ~12% margin per side)
  // Base icon already has ~6% margin; adding viewBoxPadding = 36 gives ~12% margin per side
  const applePng = await sharp(
    createRasterSvg({
      strokeWidth: 1.5,
      viewBoxPadding: 36,
      bg: '#eceae5',
    })
  )
    .resize(180, 180)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), applePng);

  console.log('Generated favicons in public/:');
  console.log(' - favicon.svg:', fs.statSync(path.join(publicDir, 'favicon.svg')).size, 'bytes');
  console.log(' - favicon.ico (16x16 + 32x32):', icoBuffer.length, 'bytes');
  console.log(' - favicon-96x96.png:', png96.length, 'bytes');
  console.log(' - apple-touch-icon.png (180x180):', applePng.length, 'bytes');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
