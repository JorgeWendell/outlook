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
    let psScript = `# Script gerado automaticamente para configurar contas IMAP no Outlook
# Data: ${new Date().toLocaleString('pt-BR')}
# Total de contas: ${contas.length}

# Importar o script principal (ajuste o caminho se necessário)
$scriptPath = Join-Path $PSScriptRoot "Configurar-MultiplasContasIMAP.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Error "Script não encontrado: $scriptPath"
    Write-Host "Por favor, coloque o arquivo Configurar-MultiplasContasIMAP.ps1 na mesma pasta deste script."
    exit 1
}

# Array de contas
$contasArray = @(
`;

    // Adicionar cada conta
    contas.forEach((conta: Conta, index: number) => {
      const nomeExibicao = conta.NomeExibicao || conta.Email;
      const usarSSL = conta.UsarSSL !== undefined ? conta.UsarSSL : true;
      
      psScript += `    @{
        Email = "$($conta.Email -replace '"', '`"')"
        IMAP = "$($conta.IMAP -replace '"', '`"')"
        PortaIMAP = $($conta.PortaIMAP)
        SMTP = "$($conta.SMTP -replace '"', '`"')"
        PortaSMTP = $($conta.PortaSMTP)
        Senha = "$($conta.Senha -replace '"', '`"')"
        NomeExibicao = "$($nomeExibicao -replace '"', '`"')"
        UsarSSL = `$${usarSSL.toString().toLowerCase()}
    }`;
      
      if (index < contas.length - 1) {
        psScript += ',';
      }
      psScript += '\n';
    });

    psScript += `)

# Executar script principal
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configurando $($contasArray.Count) conta(s) no Outlook" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& $scriptPath -Contas $contasArray

Write-Host ""
Write-Host "Script concluído!" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;

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

