import React, { useCallback, useEffect, useState, type Ref } from 'react';
import { Box, measureElement } from 'ink';
import useScreenSize from './useScreenSize.js';

type BoxDimensions = {
  width: number;
  height: number;
}
const useDimensions = (box: React.MutableRefObject<any>): BoxDimensions => {
  const screen = useScreenSize();

  const getSize = useCallback(() => {
    let { width, height } = measureElement(box.current);
    return { width, height };
  }, [box, screen]);

  const [size, setSize] = useState(getSize);

  useEffect(() => {
    setSize(getSize());
  }, [box, screen, getSize]);

  return size;
};

export default useDimensions;
