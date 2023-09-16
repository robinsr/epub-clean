import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import getTask from './tasks.js';
import { log, diffChars, diffLines } from './log.js';
import { getTagSummary } from './tag.js';

console.time('clean');

function getConfig (filename) {
  const contents = readFileSync(filename, 'utf8');

  return JSON.parse(contents);
}

function init(filename) {

  if (!filename) {
    throw new Error('No filename');
  }

  log(`Processing file: ${filename}`);

  if (!existsSync(filename)) {
    throw new Error(`File not found: ${filename}`);
  }

  const contents = readFileSync(filename, 'utf8');

  console.timeLog('clean', 'file loaded');

  const dom = new JSDOM(contents, { includeNodeLocations: true });

  console.timeLog('clean', 'DOM loaded');

  return { contents, dom };
}

async function run(filename, opts) {

  const { contents, dom } = init(filename);
  const $ = dom.window.document;

  const config = getConfig(opts.config);

  const tasks = config.map(conf => {
    if (!conf || !conf.task || !conf.name) {
      throw new Error('Invalid task:', conf);
    }

    return getTask(conf.task)(conf);
  })

  tasks
    .filter(task => !task.name.startsWith('X'))
    .forEach(task => {
    let { name, selector, transform } = task;
    
    console.log(`Running task: [${name}]`);

    let nodes = Array.from($.querySelectorAll('body ' + selector))
    
    console.log(`Target node count: [${nodes.length}]`);
    
    nodes.map(node => {
      let target = { node };

      // Get line number for target (will be unknown if not in original file)
      let loc = dom.nodeLocation(node)?.startLine;

      // determine if target should be cleaned
      let include = true;
      if (task.filter) {
        include = task.filter(node);
      }

      console.log('   ', getTagSummary(node, dom)[include ? 'green' : 'red']);

      return { node, loc, include }
    })
    .filter(target => {
      return target.include;
    })
    .forEach(target => {
      let { node, loc } = target;
      let result = transform($, node);
      let { remove, replace, html } = result
      let parent = node.parentNode;


      if (replace) {
        replace.forEach(([ oldEl, newEl ]) => {
          diffLines(oldEl.outerHTML, newEl.outerHTML, `${name}:${loc}`);
          parent.replaceChild(newEl, oldEl);
        });
      }

      if (remove) {
        remove.forEach(el => {
          diffChars(el.outerHTML, '', `${name}:${loc}`);
          parent.removeChild(el);
        });
      }

      if (html) {
        diffChars(parent.innerHTML, html, `${name}:${loc}`);
        parent.innerHTML = html;
      }
    });


    console.log('\n--------\n');
  });

  const modified_html = contents.replace(/<body[\w\W]+<\/body>/, $.body.outerHTML);

  if (opts.fullDiff) {
    diffLines(contents, modified_html, 'All Changes');
    //diffLines(contents, dom.serialize(), 'All Changes');
  }

  let file_out = filename;
  if (opts.debug) {
    //file_out = path.resolve(__dirname, 'test-output.html');
    file_out = new URL('../test/test-output.html', import.meta.url);
  }

  log(`Writing results to ${file_out}`);
  writeFileSync(file_out, modified_html);
  console.timeEnd('clean');
}


export default run;

