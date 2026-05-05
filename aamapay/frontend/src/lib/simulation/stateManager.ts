import { 
  Transaction, 
  TransactionStatus, 
  TimelineEvent,
  generateTxId,
  generateClaimCode,
  generateTxHash,
  eventBus,
  SystemEvent
} from './types';

export interface AppState {
  transactions: Transaction[];
  selectedTransactionId: string | null;
  agents: { id: string; name: string; pendingPayouts: number }[];
  stats: {
    totalVolume: number;
    totalTransactions: number;
    activeTransactions: number;
    totalAgents: number;
  };
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'SELECT_TRANSACTION'; payload: string | null }
  | { type: 'ADD_TIMELINE_EVENT'; payload: { txId: string; event: TimelineEvent } }
  | { type: 'UPDATE_STATS'; payload: Partial<AppState['stats']> };

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        stats: {
          ...state.stats,
          totalTransactions: state.stats.totalTransactions + 1,
          activeTransactions: state.stats.activeTransactions + 1,
          totalVolume: state.stats.totalVolume + action.payload.amount,
        },
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.id
            ? { ...tx, ...action.payload.updates, updatedAt: new Date() }
            : tx
        ),
      };

    case 'SELECT_TRANSACTION':
      return {
        ...state,
        selectedTransactionId: action.payload,
      };

    case 'ADD_TIMELINE_EVENT':
      return {
        ...state,
        transactions: state.transactions.map(tx =>
          tx.id === action.payload.txId
            ? {
                ...tx,
                timeline: [...tx.timeline, action.payload.event],
                updatedAt: action.payload.event.timestamp,
              }
            : tx
        ),
      };

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };

    default:
      return state;
  }
}

export const initialState: AppState = {
  transactions: [],
  selectedTransactionId: null,
  agents: [
    { id: '1', name: 'Sharma General Store', pendingPayouts: 3 },
    { id: '2', name: 'Nepal Grocery', pendingPayouts: 2 },
    { id: '3', name: 'City Mart', pendingPayouts: 5 },
  ],
  stats: {
    totalVolume: 2847500,
    totalTransactions: 15423,
    activeTransactions: 47,
    totalAgents: 523,
  },
};

export function processTransactionUpdate(
  transaction: Transaction,
  status: TransactionStatus,
  description: string
): Transaction {
  const newEvent: TimelineEvent = {
    status,
    timestamp: new Date(),
    description,
  };

  return {
    ...transaction,
    status,
    timeline: [...transaction.timeline, newEvent],
    updatedAt: new Date(),
  };
}