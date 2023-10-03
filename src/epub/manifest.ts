import xml2js from 'xml2js';
import { json } from '../util/string.js';
import { default as oPath } from 'object-path';
import { DCTerms, OptionalDC, RequiredDC } from './metadata-terms.js';
import { isObject } from 'remeda';
import logger from '../util/log.js';

const log = logger.getLogger(import.meta.url);


/**
 * points to a file within the epub
 */
type FileReference = string;

/**
 * when used as "id": definces a referencable object in the package
 * when used as "idref", "refines": points to another manifest object
 */
type IdReference = string;

interface SupplementalMeta {
  $name: string;
  $content?: string;
  value?: string;
}

// interface MetaProperty {
//   reference?: string;
//   prefix?: string;
//   value: string;
// }

interface MetaAttributes<T extends String> {
  property: T;
  refines?: IdReference;
  id?: string;
}

interface Meta {
  _: string;
  $: MetaAttributes<string>
}

interface TypedMeta<T extends String> {
  _: string;
  $: MetaAttributes<T>
}

type DCAttributes = RequiredDC | OptionalDC;

interface DublinCoreItem<L extends DCAttributes> extends TypedMeta<L> {
}

/** @example **/
const DCTitle: DublinCoreItem<"dc:title"> = {
  $: { property: 'dc:title', id: 'wef' }, _: '',
}


type RequiredMetadatas = DublinCoreItem<RequiredDC>;
type OptionalMetadatas = DublinCoreItem<OptionalDC>;
type OptionalDCTerms = TypedMeta<DCTerms>;

type MetadataElement =
  RequiredMetadatas |
  OptionalMetadatas |
  OptionalDCTerms |
  Meta |
  SupplementalMeta;

interface PkgMetadata {
  [key: number]: MetadataElement;
}

type ManifestItemProps = 'nav' | 'cover-image';

interface ManifestItem {
  $id: IdReference;
  $href: FileReference;
  $mediaType: string;
  $properties?: ManifestItemProps;
  $fallback?: string;
}


type PkgManifest = Array<ManifestItem>;

interface SpineItem {
  $idref: IdReference;
  $linear?: boolean;
}

interface PkgSpine {
  $toc: string; // "ncx" or ???
  itemref: SpineItem[]
}

/** @deprecated - deprecated in epub 3 */
type GuideRefType = 'cover' | 'title-page' | 'toc' | 'text';

/** @deprecated - deprecated in epub 3 */
interface GuideReference {
  $type: GuideRefType;
  $title: string;
  $href: FileReference;
}

/** @deprecated - deprecated in epub 3 */
interface PkgGuide {
  reference: GuideReference[]
}

export interface PkgAttributes {
  version: string;
}

interface EpubPackage {
  attributes: PkgAttributes;
  metadata: PkgMetadata;
  manifest: PkgManifest;
  spine: PkgSpine;
  guide?: PkgGuide;
}

const attrKey = '$';
const contentKey = '_';

const xml_opts: xml2js.ParserOptions = {
  attrkey: attrKey,
  charkey: contentKey,
  preserveChildrenOrder: true
}

const path = (...vals: string[]): string => {
  return vals.map(v => v.replaceAll(/\$(?!\.)/g, '$.')).join('.')
    .replaceAll(/\.+/g, '.')
    .replaceAll(/\$\.\$/g, '$');
}

interface objectGetter {
  getContent: () => string;
  getAttr: (path: keyof MetaAttributes<any>) => any;
}

const xmlObject = <T> (obj: object): objectGetter => {
  let objGet = oPath
  return {
    getContent(): string {
      // @ts-ignore;
      return oPath.has(obj, '_') ? oPath.get(obj, '_') : null;
    },
    getAttr(attr: string): any {
      return oPath.has(obj, '$') ? oPath.get(obj, path(attr)) : null;
    }
  }
}

export const parseManifest = async (fileContents: string): Promise<EpubPackage> => {
  let xmlManifest: object = await xml2js.parseStringPromise(fileContents, xml_opts);

  let pkg = oPath(oPath(xmlManifest).get('package'));
  let version: string = pkg.get('$.version');

  let metadata = pkg.get('metadata.0');
  log.info('metadata.0:', metadata);

  let manifest = pkg.get('manifest.0');
  log.info('manifest.0:', manifest);

  let metaPick = oPath(metadata);

  let metaElems = <TypedMeta<any>[]>metaPick.get('meta')
    .map(oPath)
    .map(o => ({
        $refines: o.get(path(attrKey,'refines')),
        $property: o.get(path(attrKey,'property')),
        value: o.get(contentKey)
    }));

  log.info('meta elems', metaElems);
  log.info(metaPick.get('dc:title'))

  let titles: DublinCoreItem<"dc:title">[] = metaPick.get('dc:title')
    .map(xmlObject)
    .map(title => {
      let refinedBy = metaElems.find(em => em.$.refines === '#' + title.getAttr('$id'))
      return { label: 'dc:title', value: title.getContent(), id: title.getAttr('$id'), refinedBy }
    });

  log.info(titles)


  return {
    attributes: {
      version: pkg.get('$.version')
    },
    metadata: {

    },
    manifest: [
      { $id: 'blah', $href: 'bleh', $mediaType: 'blah/bleh' }
    ],
    spine: {
      $toc: 'wefewf',
      itemref: [
        { $idref: 'acknowledgements.html' }
      ]
    }
  }
}