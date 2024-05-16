import { spawnSync } from "node:child_process";
import { basename, dirname } from "node:path";

import { root } from "../utils/path.js";

const byml = root("tools/byml-converter.exe");

export function BYMLConvert(resourcePath: string) {
  spawnSync(byml, ["to-byml", resourcePath]);

  return `${dirname(resourcePath)}/${basename(resourcePath, ".yaml")}.byml`;
}
