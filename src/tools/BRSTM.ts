import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";

import { root } from "../utils/path.js";
import { copyModifiedTime } from "../utils/time.js";

import { soxConvert } from "./Sox.js";

const brstm = root("tools/brstm-converter.exe");

export function BRSTMConvert(input: string, output: string, channels: number) {
  const soxPath = soxConvert(input, channels);

  spawnSync(brstm, [soxPath, "-o", output]);
  copyModifiedTime(output, input);

  rmSync(soxPath);
}
