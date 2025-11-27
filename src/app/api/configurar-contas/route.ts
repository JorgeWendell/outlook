import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

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

    // Caminho do script PowerShell
    // O script está na raiz do projeto (E:\Meus Projetos\windows\Configurar-MultiplasContasIMAP.ps1)
    // A partir de gui/interface, subimos 2 níveis
    const scriptPath = path.resolve(process.cwd(), '..', '..', 'Configurar-MultiplasContasIMAP.ps1');
    
    // Verificar se o script existe
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Script não encontrado em: ${scriptPath}. Certifique-se de que o arquivo Configurar-MultiplasContasIMAP.ps1 está acessível.` 
        },
        { status: 404 }
      );
    }

    // Converter array de contas para JSON e escapar para PowerShell
    const contasJson = JSON.stringify(contas).replace(/'/g, "''").replace(/"/g, '\\"');
    
    // Criar script PowerShell temporário que converte JSON para hashtables
    const psScript = `
$contasJson = @'
${JSON.stringify(contas, null, 2)}
'@

$contasArray = $contasJson | ConvertFrom-Json | ForEach-Object {
    @{
        Email = $_.Email
        IMAP = $_.IMAP
        PortaIMAP = [int]$_.PortaIMAP
        SMTP = $_.SMTP
        PortaSMTP = [int]$_.PortaSMTP
        Senha = $_.Senha
        NomeExibicao = if ($_.NomeExibicao) { $_.NomeExibicao } else { $_.Email }
        UsarSSL = if ($_.UsarSSL -ne $null) { [bool]$_.UsarSSL } else { $true }
    }
}

& "${scriptPath.replace(/\\/g, '\\\\')}" -Contas $contasArray
`;

    // Salvar script temporário
    const tempScriptPath = path.join(process.cwd(), 'temp-config.ps1');
    fs.writeFileSync(tempScriptPath, psScript, 'utf8');

    try {
      // Executar PowerShell
      const { stdout, stderr } = await execAsync(
        `powershell.exe -ExecutionPolicy Bypass -File "${tempScriptPath}"`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB
          timeout: 300000, // 5 minutos
        }
      );

      // Limpar arquivo temporário
      fs.unlinkSync(tempScriptPath);

      return NextResponse.json({
        success: true,
        message: `${contas.length} conta(s) configurada(s) com sucesso!`,
        output: stdout,
        error: stderr || null,
      });
    } catch (error: any) {
      // Limpar arquivo temporário em caso de erro
      if (fs.existsSync(tempScriptPath)) {
        fs.unlinkSync(tempScriptPath);
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Erro ao executar script PowerShell',
          details: error.stderr || error.stdout,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

