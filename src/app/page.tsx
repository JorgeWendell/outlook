"use client";

import { useState } from "react";
import Image from "next/image";
import { FormularioConta } from "@/components/FormularioConta";
import { ListaContas } from "@/components/ListaContas";
import { Status } from "@/components/Status";
import { Button } from "@/components/ui/button";
import { Mail, Settings } from "lucide-react";

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

export default function Home() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [mensagem, setMensagem] = useState<string>("");

  const handleAdicionarConta = (conta: Conta) => {
    setContas([...contas, conta]);
    setStatus("idle");
    setMensagem("");
  };

  const handleRemoverConta = (index: number) => {
    if (confirm(`Deseja remover a conta "${contas[index].Email}"?`)) {
      const novasContas = contas.filter((_, i) => i !== index);
      setContas(novasContas);
    }
  };

  const handleLimparTodas = () => {
    if (confirm(`Deseja remover todas as ${contas.length} conta(s)?`)) {
      setContas([]);
      setStatus("idle");
      setMensagem("");
    }
  };

  const handleConfigurar = async () => {
    if (contas.length === 0) {
      alert("Adicione pelo menos uma conta antes de configurar.");
      return;
    }

    if (
      !confirm(
        `Deseja gerar o script para configurar ${contas.length} conta(s) no Outlook?\n\nO script será baixado e você precisará executá-lo no seu computador Windows.\n\nCertifique-se de que o Outlook está fechado.`
      )
    ) {
      return;
    }

    setStatus("loading");
    setMensagem("Gerando script PowerShell...");

    try {
      const response = await fetch("/api/gerar-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contas }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao gerar script");
      }

      // Fazer download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `configurar-contas-${
        new Date().toISOString().split("T")[0]
      }.ps1`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("success");
      setMensagem(
        `Script gerado com sucesso! Execute o arquivo baixado no seu computador Windows.`
      );
    } catch (error) {
      setStatus("error");
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao gerar script.";
      setMensagem(errorMessage);
    }
  };

  return (
    <div className="min-h-screen  from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
            <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">
              Configurador de Contas IMAP
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Configure múltiplas contas IMAP no Outlook de forma rápida e fácil
          </p>
        </div>

        {/* Status */}
        <div className="mb-6">
          <Status status={status} message={mensagem} />
        </div>

        {/* Formulário */}
        <div className="mb-6">
          <FormularioConta onAdicionarConta={handleAdicionarConta} />
        </div>

        {/* Lista de Contas */}
        <div className="mb-6">
          <ListaContas
            contas={contas}
            onRemoverConta={handleRemoverConta}
            onLimparTodas={handleLimparTodas}
          />
        </div>

        {/* Botão de Configurar */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfigurar}
            disabled={contas.length === 0 || status === "loading"}
            size="lg"
            className="min-w-[300px]"
          >
            <Settings className="mr-2 h-5 w-5" />
            {status === "loading"
              ? "Gerando Script..."
              : "Gerar e Baixar Script"}
          </Button>
        </div>

        {/* Informações */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Como Usar:
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
            <li>Preencha todas as contas no formulário acima</li>
            <li>Clique em &ldquo;Gerar e Baixar Script&rdquo;</li>
            <li>O arquivo .ps1 será baixado automaticamente</li>
            <li>
              <strong>Importante:</strong> Coloque o arquivo{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                Configurar-MultiplasContasIMAP.ps1
              </code>{" "}
              na mesma pasta do script baixado
            </li>
            <li>Feche o Outlook completamente</li>
            <li>
              Clique com o botão direito no script baixado e selecione
              &quot;Executar com PowerShell&quot;
            </li>
            <li>
              Ou execute no PowerShell:{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                .\nome-do-arquivo.ps1
              </code>
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>&copy; Adel Systems 2025</p>
        </div>
      </div>
    </div>
  );
}
