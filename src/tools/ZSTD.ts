import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, dirname } from "node:path";

import { root } from "../utils/path.js";
import { createTemporaryFile } from "../utils/temp.js";

const zstd = root("tools/zstd.exe");
const zstdDictionary = root("tools/zs.zsdic");

export function ZSTDCompress(path: string, suffix = "byml.zs") {
  const temp = createTemporaryFile(suffix);

  spawnSync(zstd, ["--compress", path, "-D", zstdDictionary, "-o", temp]);

  return temp;
}

export function ZSTDDecompress(path: string) {
  const pathOutput = `${dirname(path)}/${basename(path, ".zs")}`;

  if (!existsSync(pathOutput)) {
    spawnSync(zstd, [
      "--decompress",
      path,
      "-D",
      zstdDictionary,
      "-o",
      pathOutput,
    ]);
  }

  return pathOutput;
}
