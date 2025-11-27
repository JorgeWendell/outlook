# Interface Web - Configurador de Contas IMAP

## 🚀 Como Usar

### Desenvolvimento

```bash
cd gui/interface
npm run dev
```

Acesse: http://localhost:3000

### Produção

```bash
npm run build
npm start
```

## 📋 Funcionalidades

- ✅ Interface moderna com Shadcn UI
- ✅ Formulário para adicionar contas IMAP
- ✅ Lista visual de todas as contas
- ✅ Remover contas individualmente ou todas
- ✅ Configuração automática via API
- ✅ Status em tempo real
- ✅ Validação de campos
- ✅ Design responsivo

## 🔧 Estrutura

```
gui/interface/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── configurar-contas/
│   │   │       └── route.ts        # API route para executar PowerShell
│   │   └── page.tsx                # Página principal
│   └── components/
│       ├── FormularioConta.tsx     # Formulário de entrada
│       ├── ListaContas.tsx         # Tabela de contas
│       └── Status.tsx              # Componente de status
```

## ⚙️ Configuração

### Caminho do Script PowerShell

O script `Configurar-MultiplasContasIMAP.ps1` deve estar acessível. O caminho padrão é:

```
E:\Meus Projetos\windows\Configurar-MultiplasContasIMAP.ps1
```

Se o script estiver em outro local, ajuste o caminho em:
`src/app/api/configurar-contas/route.ts`

### Permissões

- O servidor Node.js precisa ter permissão para executar PowerShell
- O script PowerShell precisa ter permissão de execução
- O Outlook deve estar fechado durante a configuração

## 🐛 Solução de Problemas

### Erro: Script não encontrado

1. Verifique se o arquivo `Configurar-MultiplasContasIMAP.ps1` existe
2. Ajuste o caminho em `route.ts` se necessário
3. Use caminho absoluto se relativo não funcionar

### Erro: Permissão negada

1. Execute o servidor como administrador
2. Configure a política de execução do PowerShell:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### Erro: Timeout

- Aumente o timeout na API route (padrão: 5 minutos)
- Verifique se o Outlook está fechado
- Verifique se os servidores IMAP/SMTP estão acessíveis

## 📝 Notas

- As senhas são enviadas via HTTP (use HTTPS em produção)
- O servidor precisa estar no mesmo computador que o Outlook (ou ter acesso remoto)
- A API executa o PowerShell de forma síncrona (pode demorar)

## 🔒 Segurança

⚠️ **Importante**: Esta interface envia senhas via HTTP. Para produção:

1. Use HTTPS
2. Considere autenticação
3. Valide e sanitize todas as entradas
4. Use variáveis de ambiente para caminhos sensíveis

