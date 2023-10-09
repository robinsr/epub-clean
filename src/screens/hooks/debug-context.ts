import { createContext } from 'react';

export interface DebugProps {
  flexBorders: boolean;
}

export const debugSettings: DebugProps = {
  flexBorders: false
}

const DebugContext = createContext<DebugProps>(debugSettings);

export default DebugContext;
