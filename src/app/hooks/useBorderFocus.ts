import { useContext } from 'react';
import { useFocus } from 'ink';
import DebugContext from '../hooks/debug-context.js';
import HistoryContext from '../hooks/history-context.js';
import useLocation from './useLocation.js';
import { useStore } from '../pages/inspect/inspect-store.js';

type FocusParams = {
  isActive?: boolean;
  autoFocus?: boolean;
  id?: string;

  /**
   * Override border display logic
   */
  showBorders?: boolean;
};

const defaultArgs = {
  isActive: false,
  autoFocus: false,
  id: 'default-border-focus',
  showBorders: false,
}

const useBorderFocus = (params: FocusParams) => {
  let { isActive, autoFocus, id, showBorders } = Object.assign(defaultArgs, params);

  const debug = useContext(DebugContext);
  const { location } = useLocation();
  const { ui } = useStore();
  const { focus } = useFocus();


  const { isFocused } = useFocus({ isActive, autoFocus, id });

  if (ui.focus === id) {
    focus(id);
  }

  let borders = {}

  if (showBorders || debug.flexBorders) {
    borders = {
      borderStyle: 'round',
      borderColor: isFocused ? 'white' : 'red'
    }
  }

  return { isFocused, borders }
}

export default useBorderFocus;
