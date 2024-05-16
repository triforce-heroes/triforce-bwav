import { tmpdir } from "node:os";

export function createTemporaryFile(extension = "wav") {
  return `${tmpdir()}/${Math.random().toString(16).slice(2)}.${extension}`;
}
