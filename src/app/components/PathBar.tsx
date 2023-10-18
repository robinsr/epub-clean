import React from 'react';
import { Box, Static, Text } from 'ink';
import { isFunction, isString, isNonNull } from 'remeda';
import { nanoid } from 'nanoid'


const getPathValue = (part: StringGetter | string): string => {
  if (isFunction(part)) return part();
  if (isString(part)) return part;
  return null;
}

type StringGetter = string | (() => string)
type PathBarProps = {
  base: string;
  components: StringGetter[];
}
const PathBar: React.FC<PathBarProps> = ({ base, components = [] }) => {
  return (
    <Box flexGrow={1}>
      <Text>{
        components.map(getPathValue)
          .filter(isNonNull)
          .reduce((acc, part) => `${acc} >> [${part}]`, `Path: [${base}]`)
        }
      </Text>
    </Box>
  )
}

export default PathBar;
