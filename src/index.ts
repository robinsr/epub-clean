import { Command } from 'commander';
import { config, loadConfig } from '@app-config/main';

// you're best off initializing config ASAP in your program
async function main() {
  await loadConfig();

  console.log({ config });
}

main()
  .then(() => {
    return import('./clean.js')
  })
  .then(clean => {

    const program = new Command();

    program
      .name('epub-clean')
      .description('CLI to transform/reformat ePub')
      .version('0.0.0');

    program
      .command('clean <source>', { isDefault: true })
      .description('process source html file (in place)')
      //.passThroughOptions()
      .requiredOption('-c, --config <type>', 'list of tasks to perform')
      .option('-d, --debug', 'redirect output to test/test-output.html')
      .option('-fd, --full-diff', 'prints full file diff')
      .option('--dryrun', 'does not write output')
      .option('--targets', 'prints targets to by updated without performing updates')
      .action((filename, opts: CleanCmdOpts) => {
        global.__opts = opts;
        return clean.default(filename, opts);
      });

    program.parse();
  });
