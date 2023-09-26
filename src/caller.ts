import { basename, dirname } from 'node:path';
import callsites from 'callsites';
import { mapSourcePosition } from 'source-map-support';


const caller = (this_file: string) => {
  const dir_name = dirname(this_file);
  return (): string => {
    let cs = callsites();
    let caller = cs.find(cs => {
      return cs.getFileName() !== this_file;
    })

    if (!caller) {
      caller = cs.at(-2);
    }

    let position = {
      source: caller.getFileName(),
      line: caller.getLineNumber(),
      column: caller.getColumnNumber()
    }

    let src_map = mapSourcePosition(position);
    let line_no = src_map ? src_map.line : position.line;
    let name = src_map ? basename(src_map.source) : position.source.replace(dir_name, '');

    return name + ':' + line_no;
  }
}

export default caller;
