#!/usr/bin/env node
import {resolve} from 'node:path';

process.env['NODE_CONFIG_DIR'] = new URL('../config/', import.meta.url).pathname;
// console.log('process.cwd:', process.cwd());
// console.log('import.meta.url', import.meta.url);
//console.log('NODE_CONFIG_DIR', process.env['NODE_CONFIG_DIR']);

import clear from 'clear';
import chalk from 'chalk';
import figlet from 'figlet';
import { Command, Option } from 'commander';
const program = new Command();
import { filetype_mimes } from './epub/mimetypes.js'

clear();

console.log(
  chalk.red(figlet.textSync('eSnub', { horizontalLayout: 'full' }))
);

program
  .name('epub-clean')
  .description('CLI to transform/reformat ePub')
  .version('0.0.1');

program
  // .command('clean <source>', { isDefault: true })
  .command('clean <epubfile>')
  .aliases([ 'c', 'transform', 't' ])
  .description('Process source html file (in place)')
  //.passThroughOptions()
  .requiredOption('-c, --config <type>', 'list of tasks to perform')
  .option('-d, --debug', 'redirect output to test/test-output.html')
  .option('-fd, --full-diff', 'prints full file diff')
  .option('--dryrun', 'does not write output')
  .option('--targets', 'prints targets to by updated without performing updates')
  .action(async (filename, opts: CleanCmdOpts) => {
    global.__opts = opts;
    let clean = await import('./cmd/clean.js');
    await clean.default(filename, opts);
    //return clean(filename, opts);
  });

program
  .command('inspect <epubfile>')
  .alias('i')
  .description('inspect the contents of an ePub')
  .addOption(new Option('-t, --filetype <str>', 'type of file to list').choices(Object.keys(filetype_mimes)))
  .option('-m, --manifest', 'Displays the book\'s manifest properties')
  .action(async (epubfile, opts: InspectCmdOpts) => {
    let inspect = await import('./cmd/inspect-epub.js')
    await inspect.default(epubfile, opts);
  });

program.parse();