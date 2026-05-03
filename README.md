# 🐷 Cofrinho da Ana

Sistema de controle financeiro pessoal desenvolvido com Next.js 16 e autenticação OIDC.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **Bun** - Runtime JavaScript ultra-rápido
- **PostgreSQL** - Banco de dados
- **OIDC** - Autenticação com controle de permissões
- **Tailwind CSS + DaisyUI** - Estilização
- **TypeScript** - Tipagem estática

## ✨ Funcionalidades

- ✅ Autenticação segura via OIDC
- ✅ Adicionar transações financeiras
- ✅ Visualizar histórico de transações
- ✅ Calcular saldo total
- ✅ Excluir transações (somente admins)
- ✅ Dashboard interativo

## 📋 Pré-requisitos

- [Bun](https://bun.sh) instalado
- PostgreSQL rodando
- Servidor OIDC configurado

## 🔧 Configuração

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/cofrinho-da-ana.git
cd cofrinho-da-ana
```

2. Instale as dependências:

```bash
bun install
```

3. Configure as variáveis de ambiente (crie um arquivo `.env.local`):

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/cofrinho
OIDC_ISSUER=https://seu-servidor-oidc.com
OIDC_CLIENT_ID=seu-client-id
OIDC_CLIENT_SECRET=seu-client-secret
OIDC_REDIRECT_URI=http://localhost:3000/auth/callback
```

4. Execute as migrações (criadas automaticamente na primeira execução)

## 🏃 Executando o Projeto

### Modo Desenvolvimento

```bash
bun dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
bun build
bun start
```

## 📁 Estrutura do Projeto

```
app/
├── actions/          # Server Actions do Next.js
│   ├── addTransaction.ts
│   ├── deleteTransaction.ts
│   └── loadTransactions.ts
├── auth/            # Rotas de autenticação
│   ├── login/
│   ├── logout/
│   └── callback/
├── dashboard/       # Área logada
│   ├── components/
│   └── addTransaction/
├── db/              # Camada de banco de dados
└── service/         # Serviços (OIDC)
```

## 🔐 Autenticação

O sistema utiliza OIDC (OpenID Connect) para autenticação. Usuários com a role `admin` têm permissões adicionais para excluir transações.

## 🛠️ Scripts Disponíveis

- `bun dev` - Inicia servidor de desenvolvimento
- `bun build` - Gera build de produção
- `bun start` - Executa build de produção
- `bun lint` - Executa linter ESLint

## 📝 Licença

Este é um projeto pessoal.

## 👨‍💻 Autor

Desenvolvido com 💙 por gsbenevides2
