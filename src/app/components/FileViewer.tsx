import * as React from 'react';
import { Text } from 'ink';
import { highlight, Theme } from 'cli-highlight';
import { extractFile } from '../../epub/fs.js';
import { EpubFile } from '../../epub/mimetypes.js';

export interface Props {
	file: EpubFile;
	language?: string;
	theme?: Theme;
}
/**
 * SyntaxHighlight.
 */
const FileViewer: React.FC<Props> = ({ file, language, theme }) => {
  extractFile(file.path, file.getValue().path)
  .then(filedata => {
    filedata
  })


	const highlightedCode = React.useMemo(() => {
		return highlight(code, { language, theme });
	}, [ code, language, theme ]);

	return <Text>{highlightedCode}</Text>;
};

export default FileViewer;
