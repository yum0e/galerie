import { Command } from "commander";

export const cli = new Command();
cli.name("galerie").description("Photo sharing application").version("0.1.0");

cli.parse(process.argv);
