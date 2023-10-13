import React, { useEffect, useState } from 'react';
import { Text, Newline, useInput, useFocus } from 'ink';
import { highlight, Theme } from 'cli-highlight';
import { extractFile } from '../../epub/fs.js';
import {
  EpubFile
} from '../../epub/mimetypes.js';
import { json } from '../../util/string.js';
import useBorderFocus from '../hooks/useBorderFocus.js';

export interface Props {
	file: EpubFile;
  epubPath: string;
  onBack: () => void;
	theme?: Theme;
}
const FileViewer: React.FC<Props> = ({ file, epubPath, onBack, theme }) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ contents, setContents ] = useState('');

  const id = '#file-viewer';

  const { isFocused, borders } = useBorderFocus({ id, isActive: true });

  useInput((input, key) => {
    if (input === 'b' || key.leftArrow) {
      return onBack();
    }
  })

  if (!file.isTextual) {
    return (
      <Text>
        File {file.path} is not textual
        <Newline />
        {json(file)}
      </Text>
    )
  }

  if (!file.language) {
    return (
      <Text>
        Language detected for {file.path} ({file.contentType}) is not supported
      </Text>
    );
  }

  const highlightedCode = React.useMemo(() => {
    return highlight(contents, { language: file.language, theme });
  }, [ contents, file, theme ]);

  useEffect(() => {
    extractFile(epubPath, file.path)
      .then(contents => {
        setContents(contents);
        setIsLoading(false);
      })
  }, [ file, epubPath ]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  } else {
	  return <Text>{highlightedCode}</Text>;
  }
};

export default FileViewer;
