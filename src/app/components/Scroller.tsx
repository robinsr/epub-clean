import React, { useRef, useState, useEffect } from "react";
import { Box, Text, Newline, measureElement, useInput, useStderr } from "ink";
import { default as ansi } from 'ansi-escapes';

type Command =
  'one-line-up' |
  'one-line-down' |
  'half-page-up' |
  'half-page-down' |
  'go-to-top' |
  'go-to-bottom' |
  'left' |
  'right';


type Layout = {
  height: number;
  width: number;
};

export interface Props {
  height: number;
  width: number;
  content?: string;
  children?: React.ReactNode;
}

export const Scroller: React.FC<Props> = ({ height, width, content, children }) => {
  const ref = useRef();
  const { write } = useStderr();

  const beep = () => {
    write(ansi.beep);
  }

  const [layout, setLayout] = useState<Layout>({
    height: 0,
    width: 0,
  });

  useEffect(() => {
    // @ts-ignore
    setLayout(measureElement(ref.current));
  }, [ width, height ]);

  const [footerDimensions, setFooterDimensions] = useState({
    height: 0,
    width: 0
  });

  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  const handleCommand = (command: Command) => {
    let maxScroll = layout.height - height + 4;
    let pageSize = Math.floor(height / 2);

    switch (command) {
      case 'one-line-up': {
        if (top === 0) {
          beep();
          break;
        }
        setTop(Math.max(0, top - 1));
        break;
      }
      case 'one-line-down': {
        if (top >= maxScroll) beep();
        setTop(Math.min(maxScroll, top + 1));
        break;
      }
      case 'left': {
        setLeft(Math.max(0, left - 1));
        break;
      }
      case 'right': {
        setLeft(Math.min(width, left + 1));
        break;
      }
      case 'half-page-up': {
        if (top <= 0) beep();
        setTop(Math.max(0, top - pageSize));
        break;
      }
      case 'half-page-down': {
        if (top >= maxScroll) beep();
        setTop(Math.min(maxScroll, top + pageSize));
        break;
      }
      case 'go-to-top': {
        setTop(0);
        break;
      }
      case 'go-to-bottom': {
        setTop(maxScroll)
        break;
      }
    }
  };

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      handleCommand('one-line-down');
    }
    else if (input === "k" || key.upArrow) {
      handleCommand('one-line-up');
    }
    else if (input === "h" || key.leftArrow) {
      handleCommand('left');
    }
    else if (input === "l" || key.rightArrow) {
      handleCommand('right');
    }
    else if (input === "u") {
      handleCommand('half-page-up');
    }
    else if (input === "d") {
      handleCommand('half-page-down');
    }
    else if (input === "g") {
      handleCommand('go-to-top');
    }
    else if (input === "G") {
      handleCommand('go-to-bottom');
    }
  });

  return (
    <Box
      height={height}
      width={width}
      flexDirection="column"
      borderStyle="round"
    >
      <Box
        height={layout.height - footerDimensions.height - 2}
        width={layout.width - 2}
        flexDirection="column"
        overflow="hidden"
      >
        <Box
          // @ts-ignore
          ref={ref}
          flexShrink={0}
          flexDirection="column"
          marginTop={-top}
          marginLeft={-left}
          width={layout.width - 2}
        >
          {content ?
          <Text>
            {content}
            <Newline/>
            <Text inverse={true}>END</Text>
          </Text>
          : children}
        </Box>
      </Box>
    </Box>
  );
};