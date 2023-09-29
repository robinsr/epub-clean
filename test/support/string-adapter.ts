import { Adapter } from "../../src/dom/dom.js";

const htmlstring = fragment => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  ${fragment}
</body>
</html>`;

const HTMLStringAdapter = (fragment: string): Adapter => {
  return {
    getContents() {
      return htmlstring(fragment);
    },

    diffWith(u: string): void {
    },

    saveContents(c: string): void {
    },

    get target(): string {
      return 'nowhere';
    },
  }
}

export default HTMLStringAdapter;
