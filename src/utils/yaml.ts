import fs, { writeFileSync } from "node:fs";

import { Pair, Scalar, YAMLMap, YAMLSeq, parseDocument, stringify } from "yaml";

import { HashTag } from "../tags/HashTag.js";
import { Unsigned, UnsignedTag } from "../tags/UnsignedTag.js";

import { root } from "./path.js";
import { createTemporaryFile } from "./temp.js";

export const resources = parseDocument(
  fs.readFileSync(root("fixtures/bwav-resources.yaml")).toString(),
  { customTags: [HashTag, UnsignedTag] },
);

export const resourcesHashes = Object.fromEntries(
  (resources.contents as YAMLMap).items.map((resource) => {
    const resourceValue = resource.value as YAMLMap;

    const hashPair = resourceValue.items.find(
      (pair) => (pair.key as Scalar).value === "Hash",
    )!;

    return [
      ((hashPair.value as Scalar).value as Unsigned).value,
      resourceValue,
    ];
  }),
);

interface ADPCMChannelInfo {
  contextOffset: number;
  parameterOffset: number;
  sampleNumOffset: number;
  waveDataOffset: number;
}

const ADPCMChannels: ADPCMChannelInfo[] = [
  {
    contextOffset: 0x54,
    parameterOffset: 0x20,
    sampleNumOffset: 0x18,
    waveDataOffset: 0x40,
  },
  {
    contextOffset: 0xa0,
    parameterOffset: 0x6c,
    sampleNumOffset: 0x64,
    waveDataOffset: 0x8c,
  },
];

export function resourceADPCMSet(resource: YAMLMap, buffer: Buffer) {
  const wavChannelInfo = new YAMLSeq();

  for (const channel of ADPCMChannels) {
    const wavADPCMContext = new Scalar(
      buffer
        .subarray(channel.contextOffset, channel.contextOffset + 6)
        .toString("base64"),
    );

    wavADPCMContext.tag = "!!binary";

    const wavADPCMParameter = new Scalar(
      buffer
        .subarray(channel.parameterOffset, channel.parameterOffset + 32)
        .toString("base64"),
    );

    wavADPCMParameter.tag = "!!binary";

    const wavSampleNum = new Scalar(
      new Unsigned(buffer.readUInt32LE(channel.sampleNumOffset)),
    );

    wavSampleNum.tag = "!u";

    const wavWaveDataOffset = new Scalar(
      new Unsigned(buffer.readUInt32LE(channel.waveDataOffset)),
    );

    wavWaveDataOffset.tag = "!u";

    const wavChannelInfoZero = new YAMLMap();

    wavChannelInfoZero.flow = true;
    wavChannelInfoZero.add(new Pair("AdpcmContext", wavADPCMContext));
    wavChannelInfoZero.add(new Pair("AdpcmParameter", wavADPCMParameter));
    wavChannelInfoZero.add(new Pair("SampleNum", wavSampleNum));
    wavChannelInfoZero.add(new Pair("WaveDataOffset", wavWaveDataOffset));

    wavChannelInfo.add(wavChannelInfoZero);
  }

  resource.add(new Pair("ChannelInfo", wavChannelInfo), true);

  const wavChannelHash = new Scalar(new Unsigned(buffer.readUInt32LE(0x08)));

  wavChannelHash.tag = "!u";

  resource.add(new Pair("Hash", wavChannelHash), true);
}

export function resourceLopusSet(
  resource: YAMLMap,
  buffer: Buffer,
  samples: number,
  channels: number,
) {
  const wavChannelInfo = new YAMLSeq();
  const wavSampleNum = new Scalar(new Unsigned(samples));

  wavSampleNum.tag = "!u";

  const wavWaveDataOffset = new Scalar(new Unsigned(buffer.readUInt32LE(0x40)));

  wavWaveDataOffset.tag = "!u";

  const wavChannelInfoZero = new YAMLMap();

  wavChannelInfoZero.flow = true;
  wavChannelInfoZero.add(new Pair("SampleNum", wavSampleNum));
  wavChannelInfoZero.add(new Pair("WaveDataOffset", wavWaveDataOffset));

  wavChannelInfo.add(wavChannelInfoZero);

  if (channels === 2) {
    const wavWaveDataOffsetOne = new Scalar(
      new Unsigned(buffer.readUInt32LE(0x8c)),
    );

    wavWaveDataOffsetOne.tag = "!u";

    const wavChannelInfoOne = new YAMLMap();

    wavChannelInfoOne.flow = true;
    wavChannelInfoOne.add(new Pair("SampleNum", wavSampleNum));
    wavChannelInfoOne.add(new Pair("WaveDataOffset", wavWaveDataOffsetOne));

    wavChannelInfo.add(wavChannelInfoOne);
  }

  resource.add(new Pair("ChannelInfo", wavChannelInfo), true);

  const wavChannelHash = new Scalar(new Unsigned(buffer.readUInt32LE(0x08)));

  wavChannelHash.tag = "!u";

  resource.add(new Pair("Hash", wavChannelHash), true);
}

export function resourcesWrite() {
  const resourcePath = createTemporaryFile("yaml");

  writeFileSync(
    resourcePath,
    stringify(resources, {
      customTags: [HashTag, UnsignedTag, "binary"],
    }),
  );

  return resourcePath;
}
