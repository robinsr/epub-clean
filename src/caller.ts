import { basename, dirname } from 'node:path';
import callsites from 'callsites';
import { mapSourcePosition } from 'source-map-support';


interface Position {
  source: string;
  line: number;
  column: number;
}

export const getSourceTS = (pos: Position) => {
  return mapSourcePosition(pos);
}

export const callerFn = (this_file: string) => {
  const dir_name = dirname(this_file);
  return (pos?: Position): string => {

    let cs = callsites();
    let caller = cs.find(cs => {
      return ![ this_file, import.meta.url ].includes(cs.getFileName())
    })

    if (!caller) {
      caller = cs.at(-2);
    }

    let position = {
      source: caller.getFileName(),
      line: caller.getLineNumber(),
      column: caller.getColumnNumber()
    }

    let src_map = getSourceTS(position);
    let line_no = src_map ? src_map.line : position.line;
    let name = src_map ? basename(src_map.source) : position.source.replace(dir_name, '');

    return name + ':' + line_no;
  }
}
