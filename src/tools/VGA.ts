import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";

import { crc32 } from "crc";

import { root } from "../utils/path.js";
import { createTemporaryFile } from "../utils/temp.js";
import { copyModifiedTime } from "../utils/time.js";

import { soxConvert, soxSamples } from "./Sox.js";

const vga = root("tools/vgaudio.exe");

export function VGAConvert(input: string, output: string, channels: number) {
  const soxPath = soxConvert(input, 1);
  const soxDualChannel = channels === 2;

  const lopusPath = createTemporaryFile("lopus");

  spawnSync(vga, ["-c", soxPath, lopusPath]);

  const wavData = readFileSync(lopusPath);

  rmSync(lopusPath);

  wavData.writeUInt8(0x00, 0x0a);

  const wavChannels = soxDualChannel
    ? Buffer.concat([wavData, wavData])
    : wavData;

  const bwavData = readFileSync(
    root(
      soxDualChannel
        ? "fixtures/bwav-channel-2.bwav"
        : "fixtures/bwav-channel-1.bwav",
    ),
  );

  bwavData.writeUInt32LE(crc32(wavChannels), 0x08);

  const samples = soxSamples(soxPath);

  rmSync(soxPath);

  bwavData.writeUInt32LE(samples, 0x18);
  bwavData.writeUInt32LE(samples, 0x1c);

  if (soxDualChannel) {
    bwavData.writeUInt32LE(samples, 0x64);
    bwavData.writeUInt32LE(samples, 0x68);

    bwavData.writeUInt32LE(wavData.length + 192, 0x8c);
    bwavData.writeUInt32LE(wavData.length + 192, 0x90);
  }

  writeFileSync(output, Buffer.concat([bwavData, wavChannels]));
  copyModifiedTime(output, input);
}
