import {
  cpSync,
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { basename, dirname } from "node:path";

import { fatal } from "@triforce-heroes/triforce-core/Console";
import archiver from "archiver";
import { globSync } from "glob";
import { Extract } from "unzipper";
import { YAMLMap, YAMLSeq } from "yaml";

import { BRSTMConvert } from "../tools/BRSTM.js";
import { BYMLConvert } from "../tools/BYML.js";
import { VGAConvert } from "../tools/VGA.js";
import { ZSTDCompress } from "../tools/ZSTD.js";
import { wavesHashes } from "../utils/hash.js";
import { isModified } from "../utils/time.js";
import {
  resourceADPCMSet,
  resourceLopusSet,
  resourcesHashes,
  resourcesWrite,
} from "../utils/yaml.js";

interface ConvertCommandOptions {
  force?: boolean;
  keepTemps?: boolean;
  copy?: string;
}

export async function ConvertCommand(options: ConvertCommandOptions) {
  if (options.copy !== undefined) {
    if (existsSync(options.copy)) {
      rmSync(options.copy, { recursive: true, force: true });
      mkdirSync(options.copy, { recursive: true });
    } else {
      fatal(`The path "${options.copy}" does not exist.`);
    }
  }

  process.stdout.write("Searching by WAV files...\n");

  const files = globSync("**/*.wav", {
    cwd: process.cwd(),
    posix: true,
  });

  if (files.length === 0) {
    process.stdout.write("- None files found.");

    return;
  }

  process.stdout.write(`- Found ${String(files.length)} files.\n\n`);
  process.stdout.write("Converting...\n");

  const archiveOutput = createWriteStream("romfs.zip");
  const archive = archiver("zip");

  archive.pipe(archiveOutput);

  for (const file of files) {
    const fileBasename = basename(file, ".wav");
    const fileBasenameBWAV = `${dirname(file)}/${fileBasename}.c.bwav`;

    if (!wavesHashes.has(fileBasename)) {
      process.stdout.write(`- ${file}... INVALID\n`);
      continue;
    }

    const wavHash = wavesHashes.get(fileBasename)!;
    const wavResource = resourcesHashes[wavHash]!;

    const wavPathPrefix = fileBasename.split("_Text_")[0]!;
    const wavPathDirectory = `romfs/Voice/Resource/USen/EventFlowMsg/${wavPathPrefix}_Stream`;

    const resourceChannels = wavResource.items[0]!.value as YAMLSeq;
    const resourceChannelsCount = resourceChannels.items.length;

    const resourceChannel = resourceChannels.items[0]! as YAMLMap;
    const resourceChannelDSP = resourceChannel.items.length === 4;

    const fileIsModified =
      options.force === true ||
      !existsSync(fileBasenameBWAV) ||
      isModified(file, fileBasenameBWAV);

    if (fileIsModified) {
      process.stdout.write(
        `- [${resourceChannelDSP ? `D` : `L`}${String(resourceChannelsCount)}] ${file}... `,
      );
    }

    if (resourceChannelDSP) {
      if (fileIsModified) {
        BRSTMConvert(file, fileBasenameBWAV, resourceChannelsCount);
      }

      resourceADPCMSet(wavResource, readFileSync(fileBasenameBWAV));
    } else {
      if (fileIsModified) {
        VGAConvert(file, fileBasenameBWAV, resourceChannelsCount);
      }

      const fileBWAV = readFileSync(fileBasenameBWAV);

      resourceLopusSet(
        wavResource,
        fileBWAV,
        fileBWAV.readUInt32LE(0x18),
        resourceChannelsCount,
      );
    }

    archive.file(fileBasenameBWAV, {
      name: `${wavPathDirectory}/${fileBasename}.bwav`,
    });

    if (fileIsModified) {
      process.stdout.write("OK\n");
    }
  }

  process.stdout.write(`\n`);
  process.stdout.write(`Patching YAML... `);

  const resourcesPath = resourcesWrite();
  const bymlPath = BYMLConvert(resourcesPath);
  const zstdPath = ZSTDCompress(bymlPath);

  archive.file(zstdPath, {
    name: `romfs/Voice/BwavInfo/USen.byml.zs`,
  });

  if (options.keepTemps === true) {
    cpSync(resourcesPath, `USen.yaml`, { force: true });
  }

  rmSync(resourcesPath);
  rmSync(bymlPath);

  process.stdout.write(`OK\n`);
  process.stdout.write(`Compressing... `);

  await archive.finalize();

  rmSync(zstdPath);

  process.stdout.write(`OK\n`);

  if (options.copy !== undefined) {
    process.stdout.write(`Copying... `);

    await createReadStream("romfs.zip")
      .pipe(Extract({ path: options.copy }))
      .promise();

    process.stdout.write(`OK\n`);
  }

  process.stdout.write(`\nDONE!`);
}
