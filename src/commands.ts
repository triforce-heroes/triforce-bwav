#!/usr/bin/env node
import { Command } from "commander";

import { ConvertCommand } from "./commands/ConvertCommand.js";

const program = new Command();

program
  .command("convert")
  .description("Converts .wav files to respective .bwav and patches .byml.")
  .option("-f, --force", "Overwrite existing files.", false)
  .option("-t, --keep-temps", "Keep temporary files.", false)
  .option("--copy <path>", "Copies the file to the specified path.")
  .action(ConvertCommand);

program.parse();
