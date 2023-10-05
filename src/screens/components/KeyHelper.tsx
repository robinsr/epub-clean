import React, { useState, useEffect } from 'react';
import { Text, useInput } from 'ink';

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
      .filter(i => i !== null && i !== '')
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

export default KeyHelper;
