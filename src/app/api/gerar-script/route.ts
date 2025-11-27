import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contas } = body;

    if (!contas || !Array.isArray(contas) || contas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma conta fornecida' },
        { status: 400 }
      );
    }

    // Validar contas
    for (const conta of contas) {
      const camposObrigatorios = ['Email', 'IMAP', 'SMTP', 'PortaIMAP', 'PortaSMTP', 'Senha'];
      for (const campo of camposObrigatorios) {
        if (!conta[campo]) {
          return NextResponse.json(
            { success: false, error: `Campo obrigatório ausente: ${campo}` },
            { status: 400 }
          );
        }
      }
    }

    // Gerar script PowerShell
    const dataAtual = new Date().toLocaleString('pt-BR');
    const totalContas = contas.length;
    
    let psScript = '# Script gerado automaticamente para configurar contas IMAP no Outlook\n';
    psScript += `# Data: ${dataAtual}\n`;
    psScript += `# Total de contas: ${totalContas}\n\n`;
    psScript += '# Importar o script principal (ajuste o caminho se necessário)\n';
    psScript += '$scriptPath = Join-Path $PSScriptRoot "Configurar-MultiplasContasIMAP.ps1"\n\n';
    psScript += 'if (-not (Test-Path $scriptPath)) {\n';
    psScript += '    Write-Error "Script não encontrado: $scriptPath"\n';
    psScript += '    Write-Host "Por favor, coloque o arquivo Configurar-MultiplasContasIMAP.ps1 na mesma pasta deste script."\n';
    psScript += '    exit 1\n';
    psScript += '}\n\n';
    psScript += '# Array de contas\n';
    psScript += '$contasArray = @(\n';

    // Adicionar cada conta
    contas.forEach((conta: Conta, index: number) => {
      const nomeExibicao = conta.NomeExibicao || conta.Email;
      const usarSSL = conta.UsarSSL !== undefined ? conta.UsarSSL : true;
      
      // Escapar caracteres especiais para PowerShell
      const escapePowerShell = (str: string) => {
        return str
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '`"')
          .replace(/\$/g, '`$')
          .replace(/`/g, '``');
      };
      
      psScript += '    @{\n';
      psScript += `        Email = "${escapePowerShell(conta.Email)}"\n`;
      psScript += `        IMAP = "${escapePowerShell(conta.IMAP)}"\n`;
      psScript += `        PortaIMAP = ${conta.PortaIMAP}\n`;
      psScript += `        SMTP = "${escapePowerShell(conta.SMTP)}"\n`;
      psScript += `        PortaSMTP = ${conta.PortaSMTP}\n`;
      psScript += `        Senha = "${escapePowerShell(conta.Senha)}"\n`;
      psScript += `        NomeExibicao = "${escapePowerShell(nomeExibicao)}"\n`;
      psScript += `        UsarSSL = $${usarSSL.toString().toLowerCase()}\n`;
      psScript += '    }';
      
      if (index < contas.length - 1) {
        psScript += ',';
      }
      psScript += '\n';
    });

    psScript += ')\n\n';
    psScript += '# Executar script principal\n';
    psScript += 'Write-Host "========================================" -ForegroundColor Cyan\n';
    psScript += 'Write-Host "Configurando $($contasArray.Count) conta(s) no Outlook" -ForegroundColor Cyan\n';
    psScript += 'Write-Host "========================================" -ForegroundColor Cyan\n';
    psScript += 'Write-Host ""\n\n';
    psScript += '& $scriptPath -Contas $contasArray\n\n';
    psScript += 'Write-Host ""\n';
    psScript += 'Write-Host "Script concluído!" -ForegroundColor Green\n';
    psScript += 'Write-Host "Pressione qualquer tecla para sair..."\n';
    psScript += '$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")\n';

    // Retornar o script como texto
    return new NextResponse(psScript, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="configurar-contas-${new Date().toISOString().split('T')[0]}.ps1"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao gerar script',
      },
      { status: 500 }
    );
  }
}

