import { expect } from 'chai';
import { parseContentType } from '../../../src/epub/mimetypes.js';
import { getContentType, getHighlightLang, isTextualFileType } from '../../../lib/epub/mimetypes.js';
import { planEach } from '../support/test-utils.js';

let test_cases = [
  {
    filename: 'mimetype',
    language: 'text',
    type: 'text/plain',
    parsed: {
      value: 'text/plain',
      type: 'text',
      subtype: 'plain',
      suffix: undefined
    }
  },
  {
    filename: 'META-INF/container.xml',
    language: 'xml',
    type: 'application/xml',
    parsed: {
      value: 'application/xml',
      type: 'application',
      subtype: 'xml',
      suffix: undefined
    }
  },
  {
    filename: 'some/path/toc.ncx',
    language: 'xml',
    type: 'application/x-dtbncx+xml',
    parsed: {
      value: 'application/x-dtbncx+xml',
      type: 'application',
      subtype: 'x-dtbncx',
      suffix: 'xml'
    }
  },
  {
    filename: 'some/path/content.opf',
    language: 'xml',
    type: 'application/oebps-package+xml',
    parsed: {
      value: 'application/oebps-package+xml',
      type: 'application',
      subtype: 'oebps-package',
      suffix: 'xml'
    }
  },
  {
    filename: 'some/path/chapter1.html',
    language: 'html',
    type: 'text/html',
    parsed: {
      value: 'text/html',
      type: 'text',
      subtype: 'html',
      suffix: undefined
    }
  },
  {
    filename: 'some/path/chapter2.xhtml',
    language: 'xml',
    type: 'application/xhtml+xml',
    parsed: {
      value: 'application/xhtml+xml',
      type: 'application',
      subtype: 'xhtml',
      suffix: 'xml'
    }
  },
  {
    filename: 'some/path/stylesheet.css',
    language: 'css',
    type: 'text/css',
    parsed: {
      value: 'text/css',
      type: 'text',
      subtype: 'css',
      suffix: undefined
    }
  },
  {
    filename: 'some/path/functions.js',
    language: 'javascript',
    type: 'application/javascript',
    parsed: {
      value: 'application/javascript',
      type: 'application',
      subtype: 'javascript',
      suffix: undefined
    }
  }
];


describe('Util - mimetypes', function () {

  describe('getContentType', function() {
    it('should return expected content-types for files', function () {
      planEach(test_cases.length, test_cases, ({ filename, type }) => {
        expect(getContentType(filename)).to.eq(type,
          `expected filename "${filename}" to return content-type ${type}`);
      });
    });

    it('should throw on unexpected filetype', function () {
      expect(() => getContentType('no-good.qwerty')).to.throw();
    })
  });

  describe('parseContentType', function() {
    it('should parse content-type strings into components parts', function () {
      planEach(test_cases.length, test_cases, ({ type, parsed }) => {
        expect(parseContentType(type)).to.deep.eq(parsed,
          `expected type "${type}" to return different properties`);
      });
    });
  });

  describe('isTextualFileType', function() {
    it('should return true for text-based files', function () {
      planEach(test_cases.length, test_cases, ({ filename }) => {
        expect(isTextualFileType(filename),
          `expected ${filename} to be textual`).to.be.true
      });
    });

    it('should return false for non-text-based files', function () {
      let test_cases = [
        'some/path/picture.jpg',
      ];

      planEach(test_cases.length, test_cases, test_case => {
        expect(isTextualFileType(test_case),
          `expected ${test_case} to not be textual (expected false)`).to.be.false
      });
    });
  });


  describe('getHighlightLang', function() {
    it('should return expected highlight language for files', function () {
      planEach(test_cases.length, test_cases, ({ filename, language }) => {
        expect(getHighlightLang(filename)).to.eq(language,
          `expected filename "${filename}" to return language ${language}`);
      });
    });
  });
});