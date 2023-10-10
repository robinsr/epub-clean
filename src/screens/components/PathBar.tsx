import React from 'react';
import { Box, Text } from 'ink';

type PathComponent = () => string;

type PathBarProps = {
  label: string;
  components: PathComponent[];
}
const PathBar: React.FC<PathBarProps> = ({ label, components = [] }) => {

  const path_string = components.reduce((str, component) => {
    let label = component();
    return label ? `${str} >> ${label}`: str;
  }, label);

  return (
    <Box flexGrow={1}>
      <Text>{path_string}</Text>
    </Box>
  )
}

export default PathBar;
