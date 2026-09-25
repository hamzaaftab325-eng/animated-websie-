import fs from 'node:fs';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';

const EXPECTED_FRAMES = 82;
const source = path.join(
  process.cwd(),
  'assets',
  'hero-scroll',
  'hero-scroll-frames.zip'
);
const output = path.join(
  process.cwd(),
  'public',
  'hero-scroll-frames'
);

if (!fs.existsSync(source)) {
  throw new Error(`Hero frame archive not found: ${source}`);
}

const zip = fs.readFileSync(source);
const frames = new Map();
let offset = 0;

while (offset + 4 <= zip.length) {
  const signature = zip.readUInt32LE(offset);

  if (signature !== 0x04034b50) {
    break;
  }

  if (offset + 30 > zip.length) {
    throw new Error('Invalid ZIP local header.');
  }

  const flags = zip.readUInt16LE(offset + 6);
  const compressionMethod = zip.readUInt16LE(offset + 8);
  const compressedSize = zip.readUInt32LE(offset + 18);
  const uncompressedSize = zip.readUInt32LE(offset + 22);
  const fileNameLength = zip.readUInt16LE(offset + 26);
  const extraLength = zip.readUInt16LE(offset + 28);

  if (flags & 0x08) {
    throw new Error(
      'ZIP data descriptors are not supported for the hero frame archive.'
    );
  }

  const nameStart = offset + 30;
  const nameEnd = nameStart + fileNameLength;
  const dataStart = nameEnd + extraLength;
  const dataEnd = dataStart + compressedSize;

  if (dataEnd > zip.length) {
    throw new Error('ZIP entry exceeds archive bounds.');
  }

  const fileName = zip
    .subarray(nameStart, nameEnd)
    .toString('utf8');

  const match = fileName.match(/_(\d{3})\.webp$/i);

  if (match) {
    const index = Number(match[1]);
    let payload = zip.subarray(dataStart, dataEnd);

    if (compressionMethod === 8) {
      payload = inflateRawSync(payload);
    } else if (compressionMethod !== 0) {
      throw new Error(
        `Unsupported ZIP compression method ${compressionMethod} for ${fileName}.`
      );
    }

    if (payload.length !== uncompressedSize) {
      throw new Error(`Size mismatch for ${fileName}.`);
    }

    frames.set(index, Buffer.from(payload));
  }

  offset = dataEnd;
}

if (frames.size !== EXPECTED_FRAMES) {
  throw new Error(
    `Expected ${EXPECTED_FRAMES} hero frames, found ${frames.size}.`
  );
}

for (let index = 0; index < EXPECTED_FRAMES; index += 1) {
  if (!frames.has(index)) {
    throw new Error(
      `Missing hero frame ${String(index).padStart(3, '0')}.`
    );
  }
}

fs.rmSync(output, {
  recursive: true,
  force: true,
});

fs.mkdirSync(output, {
  recursive: true,
});

for (let index = 0; index < EXPECTED_FRAMES; index += 1) {
  const fileName =
    `frame-${String(index).padStart(3, '0')}.webp`;

  fs.writeFileSync(
    path.join(output, fileName),
    frames.get(index)
  );
}

console.log(
  `Prepared ${EXPECTED_FRAMES} original 1920x1080 hero frames in public/hero-scroll-frames.`
);
