import React, { useEffect, useState } from 'react';
import { Text, Newline, useInput } from 'ink';
import { highlight, Theme } from 'cli-highlight';
import { extractFile } from '../../epub/fs.js';
import { EpubFile } from '../../epub/mimetypes.js';
import { json } from '../../util/string.js';
import { Scroller } from './Scroller.js';
import useBorderFocus from '../hooks/useBorderFocus.js';


/**
 * Replaces tab characters with two spaces. Tab characters don't display correctly
 */
const replaceTabs = (str: string): string => {
  return str.replaceAll('\u0009', '  ');
}

export interface Props {
	file: EpubFile;
  epubPath: string;
  width?: number;
  height?: number;
  onBack: () => void;
	theme?: Theme;
}
const FileViewer: React.FC<Props> = ({ file, epubPath, onBack, theme, width=100, height=25 }) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ contents, setContents ] = useState('');

  const id = '#file-viewer';

  const { isFocused, borders } = useBorderFocus({ id, isActive: true });

  useInput((input, key) => {
    if (input === 'b' || key.leftArrow) {
      return onBack();
    }
  });

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
        setContents(replaceTabs(contents));
        setIsLoading(false);
      })
  }, [ file, epubPath ]);

  if (isLoading) {
    return <Text>Loading...</Text>;
  } else {
	  return (
      <Scroller width={width-1} height={height-2} content={highlightedCode} />
    );
  }
};
// <ScrollArea height={20}>
// </ScrollArea>

export default FileViewer;
