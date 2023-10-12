import { createContext } from 'react';

export interface DebugProps {
  flexBorders: boolean;
}

export const debugSettings: DebugProps = {
  flexBorders: true
}

const DebugContext = createContext<DebugProps>(debugSettings);

export default DebugContext;
