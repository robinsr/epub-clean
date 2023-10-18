import React from 'react';
import { Box, Text, Newline } from 'ink';

const MenuHeader = ({ title }: { title: string }) => {
  return (
    <Box flexGrow={0}>
      <Text color={'gray'}>
        {title}
        <Newline />
        {'-'.repeat(title.length)}
      </Text>
    </Box>
  )
}

export default MenuHeader
