import xml2js from 'xml2js';
import { json } from '../util/string.js';
import objectPath from 'object-path';

export interface EpubManifest {
  version: string;
  title: string;
  contents: string[]
}

const attr = '$';
const content = '_';
const pkg = 'package';

const xml_opts: xml2js.ParserOptions = {
  attrkey: attr,
  charkey: content,
  preserveChildrenOrder: true
}

const path = (...vals: string[]): string => {
  return vals.join('.');
}

const mainfestPicker = (manifest:object) => <T>(prop: string): T => {
  let isAttribute = objectPath.has(manifest, path(pkg, attr, prop));

  if (isAttribute) {
    console.log('isAttribute:', path(pkg, attr, prop), 'true');
    return <T> objectPath.get(manifest, path(pkg, attr, prop));
  }

  let isContent = objectPath.has(manifest, path(pkg, prop));

  if (isContent) {
    console.log('isContent:', path(pkg, prop), 'true');
    return <T> objectPath.get(manifest, path(pkg, prop));
  }

  console.log(`Prop "${prop}" not found in manifest`);

  return null;
}

export const parseManifest = async (fileContents: string): Promise<EpubManifest> => {
  let manifest: object = await xml2js.parseStringPromise(fileContents, xml_opts);

  console.log(json(manifest));

  let pick = mainfestPicker(manifest);

  let version: string = pick('version');
  let title: string = pick(`metadata.0.dc:title.0._`);

  return {
    version,
    title,
    contents: [
      'not', 'done', 'yet'
    ]
  }
}