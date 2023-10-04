import React, { useState } from 'react';
import { Box, Spacer, Text, useApp, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { basename, extname } from 'node:path';
import { EpubFile } from '../epub/mimetypes.js';
import { sortByGetter } from '../util/sort.js';
import { inspect } from 'node:util';


let fileSorter = sortByGetter<EpubFile>(e => {
    return basename(e.path, extname(e.path));
});

const KeyHelper = () => {
  const [ theKey, setTheKey ] = useState({
    key: null, metas: []
  });

  useInput((input, key) => {
    let metas = Object.keys(key)
        .filter(k => key[k]);

    setTheKey({ key: input, metas });
  });

  let display = (key, metas = []) => {
    let pressed = [ ...metas, key ]
      .filter(i => i !== null)
      .map(i => `"${i}"`);

    if (pressed.length) {
      return `[pressed: ${pressed.join(' + ')}]`;
    } else {
      return null;
    }
  }

  return (
    <Text>{display(theKey.key, theKey.metas)}</Text>
  );
}


type ListColProps = {
  fileType: string;
}
const ListColumn = ({ fileType }: ListColProps) => {


  return (
    <div>TODO</div>
  );
}


type FileListProps = {
  files: EpubFile[];
}
export function FileList({ files = [] }: FileListProps) {
  const { exit } = useApp();
  const [ selected, setSelected ] = useState({
    label: null, value: null
  });


  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
  });

  const handleSelect = item => {
		setSelected(item);
	};

  let items = files.sort(fileSorter).map(file => ({
    label: file.path, value: file.path
  }))

  return (
    <Box flexDirection="column" borderStyle="round" paddingLeft={1} paddingRight={1}>
      <Box paddingBottom={1}>
        <Text color="blue">Select a file to do something with:</Text>
      </Box>
      <Box paddingBottom={1}>
        { selected.label ?
          <Text>You selected {selected.label} ({files.find(f => f.path = selected.value).mime})</Text>
          : <SelectInput items={items} onSelect={handleSelect} />
        }
      </Box>
      <Box>
        <KeyHelper />
        <Spacer />
        <Text color="gray">Press "q" to exit</Text>
      </Box>
    </Box>
  );
}


type InpsectProps = {
  name: string | undefined;
};

export function InspectMenu({name = 'Stranger'}: InpsectProps) {
  return (
    <Text>
      Hello, <Text color="green">{name}</Text>
    </Text>
  );
}
