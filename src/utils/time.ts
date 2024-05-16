import { statSync, utimesSync } from "node:fs";

export function isModified(path: string, reference: string) {
  const pathStat = statSync(path);
  const referenceStat = statSync(reference);

  return pathStat.mtime.toISOString() !== referenceStat.mtime.toISOString();
}

export function copyModifiedTime(path: string, reference: string) {
  const referenceStat = statSync(reference);

  utimesSync(path, referenceStat.atime, referenceStat.mtime);
}
