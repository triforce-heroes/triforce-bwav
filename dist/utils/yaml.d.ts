import { Scalar, YAMLMap, YAMLSeq } from "yaml";
export declare const resources: import("yaml").Document.Parsed<import("yaml").Alias.Parsed, true> | import("yaml").Document.Parsed<Scalar.Parsed, true> | import("yaml").Document.Parsed<YAMLMap.Parsed<import("yaml").ParsedNode, import("yaml").ParsedNode | null>, true> | import("yaml").Document.Parsed<YAMLSeq.Parsed<import("yaml").ParsedNode>, true>;
export declare const resourcesHashes: {
    [k: string]: YAMLMap<unknown, unknown>;
};
export declare function resourceADPCMSet(resource: YAMLMap, buffer: Buffer): void;
export declare function resourceLopusSet(resource: YAMLMap, buffer: Buffer, samples: number, channels: number): void;
export declare function resourcesWrite(): string;
