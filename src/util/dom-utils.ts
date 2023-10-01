import jsdom from 'jsdom';
const { JSDOM } = jsdom;
/**
 * Returns a string of HTML with fragment in <body>
 */
export const htmlstring = (fragment: string, title = 'doc-fragment') => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
  ${fragment}
</body>
</html>`;


export const newEmptyDOM = (): jsdom.JSDOM => {
  return new JSDOM(htmlstring(''), { includeNodeLocations: true });
}

export const domAPI: jsdom.JSDOM = newEmptyDOM();
