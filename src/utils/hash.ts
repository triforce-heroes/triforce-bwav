import { readFileSync } from "node:fs";

import { root } from "./path.js";

export function hash(label: string, multiplier: bigint) {
  let result = 0n;

  for (let i = 0; i < label.length; i++) {
    result = result * multiplier + BigInt(label.codePointAt(i)!);
  }

  return Number(result & BigInt(0xff_ff_ff_ff));
}

export const wavesHashes = new Map(
  Object.entries(
    JSON.parse(
      readFileSync(root("fixtures/bwav-hashes.json"), "utf8"),
    ) as Record<string, number>,
  ),
);
