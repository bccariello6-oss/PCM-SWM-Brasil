# PCM SWM Brasil - Planejamento de Manutenção Industrial

Sistema de **Planejamento e Controle de Manutenção (PCM)** para gestão de paradas programadas industriais.

## 🚀 Tecnologias

- **React 19** + TypeScript
- **Vite 6** (build tool)
- **Tailwind CSS 3** (estilização)
- **Recharts** (gráficos e Curva S)
- **Motion** (animações)
- **Supabase** (backend / autenticação)
- **XLSX** (importação de planilhas)

## 📦 Instalação

```bash
# Clonar o repositório
git clone https://github.com/bccariello6-oss/PCM-SWM-Brasil.git
cd PCM-SWM-Brasil

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

## 🔧 Desenvolvimento

```bash
# Rodar em modo de desenvolvimento
npm run dev

# O app estará disponível em http://localhost:3000
```

## 🏗️ Build de Produção

```bash
# Gerar build otimizado
npm run build

# Pré-visualizar build
npm run preview
```

## 🌐 Deploy na Vercel

1. Conecte este repositório à sua conta Vercel
2. Configure as variáveis de ambiente no painel da Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (opcional)
3. O deploy será automático a cada push na branch `main`

## 📋 Funcionalidades

- **Dashboard Gerencial** — Curva S, progresso por categoria, estatísticas gerais
- **Cronograma Operacional** — Acompanhamento de atividades em tempo real
- **Importação de Dados** — Upload de planilhas Excel com cronograma
- **Gestão de Atividades** — Atualização de progresso individual e em massa
- **Ordens Extras** — Adição de atividades não planejadas
- **Controle de Acesso** — Login com níveis Admin e Responsável

## 📄 Licença

MIT
