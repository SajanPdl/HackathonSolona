export type TransactionStatus = 
  | 'CREATED'
  | 'PENDING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'CLAIM_CODE_GENERATED'
  | 'REDEEMED'
  | 'COMPLETED'
  | 'EXPIRED';

export interface Transaction {
  id: string;
  senderName: string;
  senderAddress: string;
  recipientName: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  claimCode: string | null;
  claimCodeHash: string | null;
  txHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  status: TransactionStatus;
  timestamp: Date;
  description: string;
}

export interface Actor {
  id: string;
  name: string;
  type: 'sender' | 'recipient' | 'agent';
  walletAddress: string;
  totalTransactions: number;
}

type EventType = 
  | 'TRANSACTION_CREATED'
  | 'TX_PENDING'
  | 'TX_CONFIRMING'
  | 'TX_CONFIRMED'
  | 'CLAIM_CODE_GENERATED'
  | 'CLAIM_REDEEMED'
  | 'TX_COMPLETED';

type EventCallback = (event: SystemEvent) => void;

export interface SystemEvent {
  type: EventType;
  payload: any;
  timestamp: Date;
}

class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, EventCallback[]> = new Map();
  private allListeners: EventCallback[] = [];

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(eventType: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }

  subscribeAll(callback: EventCallback): () => void {
    this.allListeners.push(callback);
    return () => {
      const index = this.allListeners.indexOf(callback);
      if (index > -1) this.allListeners.splice(index, 1);
    };
  }

  publish(event: SystemEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(cb => cb(event));
    this.allListeners.forEach(cb => cb(event));
  }
}

export const eventBus = EventBus.getInstance();

export function generateTxId(): string {
  return `TX${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateClaimCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateWalletAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function generateTxHash(): string {
  return Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

export function generateAmount(): number {
  const amounts = [25, 50, 75, 100, 150, 200, 250, 500, 1000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

export const senderNames = [
  'Rajesh Kumar', 'Amit Singh', 'Priya Patel', 'Sarah Johnson', 
  'Michael Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson',
  'James Brown', 'Jennifer Lee', 'Robert Taylor', 'Maria Garcia'
];

export const recipientNames = [
  'Kiran Sharma', 'Sita Devi', 'Ram Prasad', 'Gita Kumari',
  'Hari Bhatta', 'Nita Rai', 'Ramesh Thapa', 'Sunita Gurung',
  'Bikash Singh', 'Anita Adhikari', 'Mohan KC', 'Laxmi Basnet'
];

export const agentNames = [
  'Sharma General Store', 'Nepal Grocery', 'City Mart',
  'Quick Cash Point', 'Express Remittance', 'Reliable Pay',
  'Easy Transfer', 'Golden Cash', 'Metro Exchange'
];