import { createReadStream } from 'node:fs';
import logger from '../util/log.js';
import enq from 'enquirer';
import { CentralDirectory, Open, ParseOne } from 'unzipper';
const { prompt: enquire } = enq;
import hl from 'cli-highlight';
import pager from 'node-pager';
import { getMimeType, filetype_mimes, filetype_labels, FileCategory, filetype_lang } from '../epub/mimetypes.js';
import { parseManifest } from '../epub/manifest.js';

declare global {
  interface InspectCmdOpts {
    manifest: boolean;
    filetype?: FileCategory;
  }
}

const log = logger.getLogger(import.meta.url);

const opf_filetype = getMimeType('.opf');

interface EpubFile {
  path: string;
  mime: string;
}

const getEpubDir = async (filename: string): Promise<EpubFile[]> => {
  const directory = await Open.file(filename);
  //console.log('directory', directory);
  return directory.files
    .filter(file => file.type === 'File')
    .map(file => ({
      mime: getMimeType(file.path),
      path: file.path
    }));

  // return new Promise( (resolve, reject) => {
  //   directory.files[0]
  //     .stream()
  //     //.pipe(createWriteStream('firstFile'))
  //     .on('error',reject)
  //     .on('finish',resolve)
  // });
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

const getFileType = async (): Promise<{filetype: FileCategory}> => {
  return enquire<{filetype: FileCategory}>({
    type: 'select',
    name: 'filetype',
    message: 'Select filetype to inspect',
    choices: Object.keys(filetype_labels).map(l => ({
      message: filetype_labels[l], name: l
    }))
  })
}

async function run(filename: string, opts: InspectCmdOpts) {
  log.debug('Inspect args:', opts);
  log.info(`Reading contents of ${filename}`);

  let epubDir = await getEpubDir(filename);

  if (opts.manifest) {
    let manifestFile = epubDir.find(file => file.mime === opf_filetype);

    if (manifestFile) {
      let contents = await getEpubFile(filename, manifestFile.path);
      let manifest = await parseManifest(contents);

      log.info('Book Contents:')

      log.info(manifest);
      return;
    }
  }


  let filetype = opts.filetype;
  if (!opts.filetype) {
    let selected = await getFileType();
    filetype = selected.filetype;
  }

  let filematchers: string[] = filetype_mimes[filetype];

  log.info('Using file matchers:', filematchers);

  let fileList = epubDir
    .filter(file => filematchers.includes(file.mime))
    .map(file => file.path)
    .sort();

  let fileOpts = {
    type: 'select',
    name: 'file',
    message: 'Select a file to inspect',
    choices: fileList
  }

  const prompt = () => {
    let file;

    return enquire<{file: string}>(fileOpts)
      .then(selected => {
        file = selected.file;
        let fileregex = new RegExp(file);
        console.log(fileregex);
        return getEpubFile(filename, file);
      })
      .then((contents) => {
        log.info('contents for file:', file)
        return pager(hl.highlight(contents, { language: filetype_lang[filetype] }))
          .then(() => {
            log.info('Exited pager')
            return prompt();
          })
      })
      .catch(err => {
        if (err) {
          log.fatal(err);
        } else {
          log.log('success', 'Exiting');
        }
        //return prompt();
      })
  }

  return prompt();
}

run.filetypes = Object.keys(filetype_mimes);

export default run;