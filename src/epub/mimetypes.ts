import mime from 'mime-types';

export type FileCategory = 'contents' | 'css' | 'media' | 'toc' | 'xml' | 'opf';

export const getMimeType = (file: string): string => {
  return mime.lookup(file) || 'unknown';
}

export const filetype_mimes: Record<FileCategory, string[]> = {
  'contents': [
    getMimeType('.html'),
    getMimeType('.xhtml'),
  ],
  'css': [
    getMimeType('.css')
  ],
  'media': [
    getMimeType('.jpg'),
    getMimeType('.png'),
  ],
  'toc': [
    getMimeType('.ncx'), // epub2
  ],
  'xml': [
    getMimeType('.xml')
  ],
  'opf': [
    getMimeType('.opf')
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
