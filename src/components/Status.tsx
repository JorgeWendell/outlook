'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

interface StatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export function Status({ status, message }: StatusProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'loading') {
      // Simular progresso indeterminado
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            return 10; // Reset para criar efeito de carregamento
          }
          return prev + 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [status]);

  if (status === 'idle') {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Pronto</AlertTitle>
        <AlertDescription>
          Adicione contas e clique em "Configurar Contas no Outlook" para começar.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'loading') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Configurando...</AlertTitle>
        <AlertDescription className="space-y-3">
          <div>
            {message || 'Por favor, aguarde enquanto as contas são configuradas no Outlook.'}
          </div>
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              Executando script PowerShell...
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'success') {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-200">Sucesso!</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          {message || 'Contas configuradas com sucesso! Verifique o Outlook.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800 dark:text-red-200">Erro</AlertTitle>
        <AlertDescription className="text-red-700 dark:text-red-300">
          {message || 'Ocorreu um erro ao configurar as contas. Tente novamente.'}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

