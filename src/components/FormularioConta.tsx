'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';

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

interface FormularioContaProps {
  onAdicionarConta: (conta: Conta) => void;
}

export function FormularioConta({ onAdicionarConta }: FormularioContaProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [imap, setImap] = useState('');
  const [portaIMAP, setPortaIMAP] = useState('993');
  const [smtp, setSmtp] = useState('');
  const [portaSMTP, setPortaSMTP] = useState('587');
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [usarSSL, setUsarSSL] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!email || !senha || !imap || !smtp) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const conta: Conta = {
      Email: email.trim(),
      IMAP: imap.trim(),
      PortaIMAP: parseInt(portaIMAP) || 993,
      SMTP: smtp.trim(),
      PortaSMTP: parseInt(portaSMTP) || 587,
      Senha: senha,
      NomeExibicao: nomeExibicao.trim() || undefined,
      UsarSSL: usarSSL,
    };

    onAdicionarConta(conta);

    // Limpar formulário
    setEmail('');
    setSenha('');
    setImap('');
    setPortaIMAP('993');
    setSmtp('');
    setPortaSMTP('587');
    setNomeExibicao('');
    setUsarSSL(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Nova Conta</CardTitle>
        <CardDescription>
          Preencha os dados da conta IMAP para adicionar ao Outlook
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeExibicao">Nome de Exibição</Label>
              <Input
                id="nomeExibicao"
                type="text"
                placeholder="Nome da conta (opcional)"
                value={nomeExibicao}
                onChange={(e) => setNomeExibicao(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">
              Senha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="senha"
              type="password"
              placeholder="Senha da conta"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imap">
                Servidor IMAP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="imap"
                type="text"
                placeholder="imap.dominio.com"
                value={imap}
                onChange={(e) => setImap(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portaIMAP">Porta IMAP</Label>
              <Input
                id="portaIMAP"
                type="number"
                placeholder="993"
                value={portaIMAP}
                onChange={(e) => setPortaIMAP(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp">
                Servidor SMTP <span className="text-red-500">*</span>
              </Label>
              <Input
                id="smtp"
                type="text"
                placeholder="smtp.dominio.com"
                value={smtp}
                onChange={(e) => setSmtp(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portaSMTP">Porta SMTP</Label>
              <Input
                id="portaSMTP"
                type="number"
                placeholder="587"
                value={portaSMTP}
                onChange={(e) => setPortaSMTP(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ssl"
              checked={usarSSL}
              onCheckedChange={(checked) => setUsarSSL(checked as boolean)}
            />
            <Label htmlFor="ssl" className="cursor-pointer">
              Usar SSL/TLS
            </Label>
          </div>

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Conta
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

