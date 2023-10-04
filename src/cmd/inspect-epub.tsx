import React from 'react';
import { createReadStream } from 'node:fs';
import enq from 'enquirer';
import { CentralDirectory, Open, ParseOne } from 'unzipper';
const { prompt: enquire } = enq;
import hl from 'cli-highlight';
import pager from 'node-pager';
import {
  getMimeType,
  filetype_mimes,
  filetype_labels,
  FileCategory,
  filetype_lang,
  EpubFile,
} from '../epub/mimetypes.js';
import { parseManifest } from '../epub/manifest.js';
import { InspectMenu, FileList } from './inspect.js';

import { render } from 'ink';

import logger from '../util/log.js';

declare global {
  interface InspectCmdOpts {
    manifest: boolean;
    filetype?: FileCategory;
  }
}

const log = logger.getLogger(import.meta.url);

const opf_filetype = getMimeType('.opf');

const getEpubDir = async (filename: string): Promise<EpubFile[]> => {
  const directory = await Open.file(filename);
  //console.log('directory', directory);
  return directory.files
    .filter(file => file.type === 'File')
    .map(file => ({
      mime: getMimeType(file.path),
      path: file.path
    }));
}

const getEpubFile = async (epubfile: string, filename: string): Promise<string> => {
  let contents = '';

  return new Promise((resolve, reject) => {
    createReadStream(epubfile)
      .pipe(ParseOne(new RegExp(filename)))
      .on('data', chunk => contents += chunk.toString())
      //.on('finish', () => resolve(contents))
      .on('end', () => resolve(contents))
      .on('error', err => {
        log.fatal(err);
        reject(new Error('read stream called error'));
      })
  })
}

const propmts = {
  getFileType: async (): Promise<{filetype: FileCategory}> => {
    return enquire<{filetype: FileCategory}>({
      type: 'select',
      name: 'filetype',
      message: 'Select filetype to inspect',
      choices: Object.keys(filetype_labels).map(l => ({
        message: filetype_labels[l], name: l
      }))
    })
  }
};

async function run(filename: string, opts: InspectCmdOpts) {
  log.debug('Inspect args:', opts);
  log.info(`Reading contents of ${filename}`);

  let epubDir = await getEpubDir(filename);

  render(<FileList files={epubDir} />);

  let mainfestInfo = async () => {
    let manifestFile = epubDir.find(file => file.mime === opf_filetype);

    if (manifestFile) {
      let contents = await getEpubFile(filename, manifestFile.path);
      return await parseManifest(contents);
    } else {
      throw new Error(`Could not find mainfest of "${filename}"`);
    }
  }

  let filetype = opts.filetype;
  if (!opts.filetype) {
    let selected = await propmts.getFileType();
    filetype = selected.filetype;
  }

  let filematchers: string[] = filetype_mimes[filetype];

  log.info('Using file matchers:', filematchers);

  let fileList = epubDir
    .filter(file => filematchers.includes(file.mime))
    .map(file => file.path)
    .sort();

}

run.filetypes = Object.keys(filetype_mimes);

export default run;