// Versão para Linux - Chama API no servidor Windows
// Renomeie este arquivo para route.ts quando for usar no Linux

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

    // URL do servidor Windows (configure via variável de ambiente)
    const windowsApiUrl = process.env.WINDOWS_API_URL || 'http://localhost:8080';
    const apiKey = process.env.WINDOWS_API_KEY || '';

    // Headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    // Chamar API do servidor Windows
    const response = await fetch(`${windowsApiUrl}/configurar`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contas }),
      signal: AbortSignal.timeout(300000), // 5 minutos
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || `Erro do servidor Windows: ${response.statusText}`,
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: data.success,
      message: data.message || `${contas.length} conta(s) configurada(s) com sucesso!`,
      output: data.output,
    });
  } catch (error: any) {
    // Erro de conexão
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeout: O servidor Windows demorou muito para responder.',
        },
        { status: 504 }
      );
    }

    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Não foi possível conectar ao servidor Windows. Verifique se o servidor está rodando e acessível.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao conectar com o servidor Windows',
      },
      { status: 500 }
    );
  }
}

