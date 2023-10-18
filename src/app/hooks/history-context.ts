import { createContext } from 'react';
import { History } from 'history';

const HistoryContext = createContext<History>(null);

export default HistoryContext;
