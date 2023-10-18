import mime from 'mime-types';

export type FileCategory = 'contents' | 'css' | 'media' | 'toc' | 'xml' | 'opf';

export interface EpubFile {
  path: string;
  contentType: string;
  isTextual: boolean;
  language: string;
}

type ContentType = {
  value: string;
  type: string;
  subtype: string;
  suffix?: string
}

export const getContentType = (file: string): string => {
  // epubs have a file named "mimetype"
  if (Object.is(file, 'mimetype')) {
    return 'text/plain'
  }

  let mimetype = mime.lookup(file);

  if (!mimetype) {
    throw new Error(`Not a mime for file: ${file}`);
  }

  return mimetype;
}

export const parseContentType = (str: string): ContentType => {
  let type: string;
  let subtype: string;
  let suffix: string;

  [ type, subtype ] = str.split('/');

  if (subtype && subtype.includes('+')) {
    suffix = subtype.replace(/.*\+/, '');
    subtype = subtype.replace(/\+.*/, '');
  }

  return { value: str, type, subtype, suffix };
}

const isUTF8 = (file: string): boolean => {
  return Object.is(mime.charset(getContentType(file)), 'UTF-8');
}

const isTextContent = (file: string): boolean => {
  let { type, subtype, suffix } = parseContentType(getContentType(file));

  if (type === 'text') {
    return true;
  } else if (suffix) {
    return Object.hasOwn(mime.extensions, `text/${suffix}`);
  } else {
    return Object.hasOwn(mime.extensions, `text/${subtype}`);
  }
}

export const isTextualFileType = (file: string): boolean => {
  return isTextContent(file) || isUTF8(file);
}

export const getHighlightLang = (file: string): string => {
  let contentType = getContentType(file);

  if (contentType === 'text/plain') {
    return 'text';
  }

  if (contentType.startsWith('text/')) {
    return contentType.replace('text/', '');
  }

  let { type, subtype, suffix } = parseContentType(contentType)

  if (suffix) {
    return suffix;
  } else {
    return subtype;
  }
}

export const filetype_mimes: Record<FileCategory, string[]> = {
  'contents': [
    getContentType('.html'),
    getContentType('.xhtml'),
  ],
  'css': [
    getContentType('.css')
  ],
  'media': [
    getContentType('.jpg'),
    getContentType('.png'),
  ],
  'toc': [
    getContentType('.ncx'), // epub2
  ],
  'xml': [
    getContentType('.xml')
  ],
  'opf': [
    getContentType('.opf')
  ]
}

export const filetype_labels: Record<FileCategory, string> = {
  'contents': 'Book Contents',
  'css': 'Stylesheets',
  'media': 'Media',
  'toc': 'Table of Contents',
  'xml': 'XML Files',
  'opf': 'Package Doc'
}

export const filetype_lang: Record<FileCategory, string> = {
  'contents': 'html',
  'css': 'css',
  'media': 'error',
  'toc': 'xml',
  'xml': 'xml',
  'opf': 'xml'
}
