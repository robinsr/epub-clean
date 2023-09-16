import { Command } from 'commander';
const program = new Command();


import clean from './src/clean.js';

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
  .action((source, opts) => {
    console.log(source);
    console.log(opts);

    clean(source, opts);
  });

program.parse();
