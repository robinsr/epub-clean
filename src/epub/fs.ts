import { createReadStream } from 'node:fs';
import { CentralDirectory, Open, ParseOne } from 'unzipper';
import { EpubFile, getContentType, getHighlightLang, isTextualFileType } from './mimetypes.js';
import logger from '../util/log.js';
import { EpubPackage, parseManifest } from './manifest.js';

const log = logger.getLogger(import.meta.url);

export const getDirectoryList = async (filename: string): Promise<EpubFile[]> => {
  const directory = await Open.file(filename);
  //console.log('directory', directory);
  return directory.files
    .filter(file => file.type === 'File')
    .map(file => ({
      contentType: getContentType(file.path),
      path: file.path,
      isTextual: isTextualFileType(file.path),
      language: getHighlightLang(file.path)
    }));
}

export const extractFile = async (epubPath: string, filePath: string): Promise<string> => {
  let contents = '';

  return new Promise((resolve, reject) => {
    createReadStream(epubPath)
      .pipe(ParseOne(new RegExp(filePath)))
      .on('data', chunk => contents += chunk.toString())
      //.on('finish', () => resolve(contents))
      .on('end', () => resolve(contents))
      .on('error', err => {
        log.fatal(err);
        reject(new Error('read stream called error'));
      })
  })
}

const opf_filetype = getContentType('.opf');

export const getManifest = async (filename: string): Promise<EpubPackage> => {
  let epubDir = await getDirectoryList(filename);

  let manifestFile = epubDir.find(file => file.contentType === opf_filetype);

  if (manifestFile) {
    let contents = await extractFile(filename, manifestFile.path);
    return await parseManifest(contents);
  } else {
    throw new Error(`Could not find mainfest of "${filename}"`);
  }
}
