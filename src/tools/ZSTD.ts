import { spawnSync } from "node:child_process";

import { root } from "../utils/path.js";
import { createTemporaryFile } from "../utils/temp.js";

const zstd = root("tools/zstd.exe");
const zstdDictionary = root("tools/zs.zsdic");

export function ZSTDCompress(path: string) {
  const temp = createTemporaryFile("byml.zs");

  spawnSync(zstd, ["--compress", path, "-D", zstdDictionary, "-o", temp]);

  return temp;
}
