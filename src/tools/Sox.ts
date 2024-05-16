import { spawnSync } from "node:child_process";

import { root } from "../utils/path.js";
import { createTemporaryFile } from "../utils/temp.js";

const sox = root("tools/sox/sox.exe");

export function soxConvert(path: string, channels: number): string {
  const temp = createTemporaryFile();

  spawnSync(sox, [path, "-r", "48000", "-c", String(channels), temp]);

  return temp;
}

export function soxSamples(path: string): number {
  return Number(
    /[=]\s(\d+)/.exec(spawnSync(sox, ["--info", path]).output.toString())![1],
  );
}
