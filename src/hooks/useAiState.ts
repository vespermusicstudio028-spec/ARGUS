import { useState, useCallback } from 'react';

export type AiStatus = 'listening' | 'processing' | 'analyzing' | 'responding';

export function useAiState() {
  const [status, setStatus] = useState<AiStatus>('listening');

  const simulateTurn = useCallback(() => {
    // Escutando -> Processando -> Analisando -> Respondendo -> Escutando
    setStatus('processing');
    
    setTimeout(() => {
      setStatus('analyzing');
    }, 1500);

    setTimeout(() => {
      setStatus('responding');
    }, 3500);

    setTimeout(() => {
      setStatus('listening');
    }, 6500);
  }, []);

  return { status, setStatus, simulateTurn };
}
