'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';

interface Conta {
  Email: string;
  IMAP: string;
  PortaIMAP: number;
  SMTP: string;
  PortaSMTP: number;
  Senha: string;
  NomeExibicao?: string;
  UsarSSL?: boolean;
}

interface ListaContasProps {
  contas: Conta[];
  onRemoverConta: (index: number) => void;
  onLimparTodas: () => void;
}

export function ListaContas({ contas, onRemoverConta, onLimparTodas }: ListaContasProps) {
  if (contas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contas Adicionadas</CardTitle>
          <CardDescription>Nenhuma conta adicionada ainda</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contas Adicionadas</CardTitle>
            <CardDescription>
              Total de contas: {contas.length}
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onLimparTodas}
            disabled={contas.length === 0}
          >
            <X className="mr-2 h-4 w-4" />
            Limpar Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>IMAP</TableHead>
                <TableHead>Porta IMAP</TableHead>
                <TableHead>SMTP</TableHead>
                <TableHead>Porta SMTP</TableHead>
                <TableHead>Nome Exibição</TableHead>
                <TableHead>SSL</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.map((conta, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{conta.Email}</TableCell>
                  <TableCell>{conta.IMAP}</TableCell>
                  <TableCell>{conta.PortaIMAP}</TableCell>
                  <TableCell>{conta.SMTP}</TableCell>
                  <TableCell>{conta.PortaSMTP}</TableCell>
                  <TableCell>{conta.NomeExibicao || conta.Email}</TableCell>
                  <TableCell>{conta.UsarSSL ? 'Sim' : 'Não'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoverConta(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

