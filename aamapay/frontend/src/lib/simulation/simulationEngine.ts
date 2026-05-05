import { 
  Transaction, 
  TransactionStatus, 
  generateTxId,
  generateClaimCode,
  generateTxHash,
  generateWalletAddress,
  generateAmount,
  senderNames,
  recipientNames,
  eventBus,
  SystemEvent
} from './types';
import { AppState, processTransactionUpdate, appReducer, initialState } from './stateManager';

class SimulationEngine {
  private static instance: SimulationEngine;
  private state: AppState = initialState;
  private subscribers: Set<(state: AppState) => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  static getInstance(): SimulationEngine {
    if (!SimulationEngine.instance) {
      SimulationEngine.instance = new SimulationEngine();
    }
    return SimulationEngine.instance;
  }

  subscribe(callback: (state: AppState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    this.subscribers.forEach(cb => cb({ ...this.state }));
  }

  private updateState(action: Parameters<typeof appReducer>[1]): void {
    this.state = appReducer(this.state, action);
    this.notify();
  }

  private createTransaction(): Transaction {
    const senderName = senderNames[Math.floor(Math.random() * senderNames.length)];
    const recipientName = recipientNames[Math.floor(Math.random() * recipientNames.length)];
    const amount = generateAmount();
    
    return {
      id: generateTxId(),
      senderName,
      senderAddress: generateWalletAddress(),
      recipientName,
      amount,
      fee: amount * 0.005,
      status: 'CREATED',
      claimCode: null,
      claimCodeHash: null,
      txHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: [{
        status: 'CREATED',
        timestamp: new Date(),
        description: 'Transaction initiated',
      }],
    };
  }

  private async processTransaction(transaction: Transaction): Promise<void> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    await delay(500 + Math.random() * 1000);
    let updatedTx = processTransactionUpdate(transaction, 'PENDING', 'Transaction submitted to blockchain');
    eventBus.publish({ type: 'TX_PENDING', payload: updatedTx, timestamp: new Date() });
    this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });

    await delay(1500 + Math.random() * 1500);
    updatedTx = processTransactionUpdate(updatedTx, 'CONFIRMING', 'Awaiting block confirmation...');
    eventBus.publish({ type: 'TX_CONFIRMING', payload: updatedTx, timestamp: new Date() });
    this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });

    await delay(2000 + Math.random() * 1000);
    updatedTx = {
      ...updatedTx,
      txHash: generateTxHash(),
      status: 'CONFIRMED' as TransactionStatus,
      timeline: [...updatedTx.timeline, {
        status: 'CONFIRMED',
        timestamp: new Date(),
        description: `Confirmed on-chain: ${generateTxHash().substring(0, 16)}...`,
      }],
    };
    eventBus.publish({ type: 'TX_CONFIRMED', payload: updatedTx, timestamp: new Date() });
    this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });

    await delay(800 + Math.random() * 700);
    const claimCode = generateClaimCode();
    updatedTx = {
      ...updatedTx,
      claimCode,
      claimCodeHash: claimCode.split('').reverse().join(''),
      status: 'CLAIM_CODE_GENERATED',
      timeline: [...updatedTx.timeline, {
        status: 'CLAIM_CODE_GENERATED',
        timestamp: new Date(),
        description: `Claim code generated: ${claimCode}`,
      }],
    };
    eventBus.publish({ type: 'CLAIM_CODE_GENERATED', payload: updatedTx, timestamp: new Date() });
    this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });

    await delay(5000 + Math.random() * 8000);
    if (Math.random() > 0.3) {
      updatedTx = {
        ...updatedTx,
        status: 'REDEEMED',
        timeline: [...updatedTx.timeline, {
          status: 'REDEEMED',
          timestamp: new Date(),
          description: 'Claimed by recipient at agent location',
        }],
      };
      eventBus.publish({ type: 'CLAIM_REDEEMED', payload: updatedTx, timestamp: new Date() });
      this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });

      await delay(1000 + Math.random() * 500);
      updatedTx = {
        ...updatedTx,
        status: 'COMPLETED',
        timeline: [...updatedTx.timeline, {
          status: 'COMPLETED',
          timestamp: new Date(),
          description: 'Transaction completed. Funds released to agent.',
        }],
      };
      eventBus.publish({ type: 'TX_COMPLETED', payload: updatedTx, timestamp: new Date() });
      this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: updatedTx.id, updates: updatedTx } });
      this.updateState({ type: 'UPDATE_STATS', payload: { activeTransactions: this.state.stats.activeTransactions - 1 } });
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const createRandomTransaction = () => {
      if (this.state.transactions.length < 20) {
        const newTx = this.createTransaction();
        this.updateState({ type: 'ADD_TRANSACTION', payload: newTx });
        eventBus.publish({ type: 'TRANSACTION_CREATED', payload: newTx, timestamp: new Date() });
        this.processTransaction(newTx);
      }

      const nextDelay = 3000 + Math.random() * 8000;
      this.intervalId = setTimeout(createRandomTransaction, nextDelay);
    };

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (this.isRunning) {
          const newTx = this.createTransaction();
          this.updateState({ type: 'ADD_TRANSACTION', payload: newTx });
          eventBus.publish({ type: 'TRANSACTION_CREATED', payload: newTx, timestamp: new Date() });
          this.processTransaction(newTx);
        }
      }, i * 1000);
    }

    this.intervalId = setTimeout(createRandomTransaction, 5000);
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  triggerRedemption(txId: string): void {
    const tx = this.state.transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'CLAIM_CODE_GENERATED') return;

    let updatedTx = processTransactionUpdate(tx, 'REDEEMED', 'Manually redeemed by agent');
    eventBus.publish({ type: 'CLAIM_REDEEMED', payload: updatedTx, timestamp: new Date() });
    this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: txId, updates: updatedTx } });

    setTimeout(() => {
      updatedTx = {
        ...updatedTx,
        status: 'COMPLETED',
        timeline: [...updatedTx.timeline, {
          status: 'COMPLETED',
          timestamp: new Date(),
          description: 'Transaction completed. Funds released.',
        }],
      };
      eventBus.publish({ type: 'TX_COMPLETED', payload: updatedTx, timestamp: new Date() });
      this.updateState({ type: 'UPDATE_TRANSACTION', payload: { id: txId, updates: updatedTx } });
    }, 1000);
  }

  getState(): AppState {
    return { ...this.state };
  }
}

export const simulationEngine = SimulationEngine.getInstance();