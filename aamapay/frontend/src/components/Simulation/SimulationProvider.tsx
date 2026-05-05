'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, initialState } from '@/lib/simulation/stateManager';
import { Transaction } from '@/lib/simulation/types';
import { simulationEngine } from '@/lib/simulation/simulationEngine';

interface SimulationContextType {
  transactions: Transaction[];
  selectedId: string | null;
  stats: AppState['stats'];
  selectTransaction: (id: string | null) => void;
  triggerRedemption: (id: string) => void;
  isRunning: boolean;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  useEffect(() => {
    simulationEngine.start();

    const unsubscribe = simulationEngine.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value: SimulationContextType = {
    transactions: state.transactions,
    selectedId: state.selectedTransactionId,
    stats: state.stats,
    selectTransaction: (id) => {
      simulationEngine.getState().selectedTransactionId = id;
    },
    triggerRedemption: (id) => {
      simulationEngine.triggerRedemption(id);
    },
    isRunning: true,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider');
  }
  return context;
}