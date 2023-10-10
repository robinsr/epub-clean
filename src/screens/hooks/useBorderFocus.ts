import { useContext } from 'react';
import { useFocus } from 'ink';
import DebugContext from '../hooks/debug-context.js';

type FocusParams = {
    isActive?: boolean;
    autoFocus?: boolean;
    id?: string;
};

const useBorderFocus = (params: FocusParams) => {
  const debug = useContext(DebugContext);

  const { isFocused } = useFocus(params);

  let borders = {}

  if (debug.flexBorders) {
    borders = {
      borderStyle: 'round',
      borderColor: isFocused ? 'white' : 'red'
    }
  }

  return { isFocused, borders }
}

export default useBorderFocus;
