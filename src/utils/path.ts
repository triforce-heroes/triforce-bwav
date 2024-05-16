import { normalize } from "node:path";

export function root(path: string) {
  return normalize(`${import.meta.dirname}/../../${path}`);
}
