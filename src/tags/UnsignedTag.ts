import { ScalarTag, Scalar } from "yaml";

export class Unsigned {
  public constructor(public readonly value: number) {}
}

export const UnsignedTag: ScalarTag = {
  tag: "!u",
  resolve(value: string) {
    return new Unsigned(Number.parseInt(value, 16));
  },
  stringify(item: Scalar) {
    return String(
      `0x${(item.value as Unsigned).value.toString(16).toUpperCase()}`,
    );
  },
};
