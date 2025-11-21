# 📦 NFe Manager - Sistema de Emissão de Notas Fiscais

Sistema completo para emissão de NFe com integração SEFAZ (Brasília-DF via SVRS).

## 🚀 Como Rodar o Sistema

### Opção 1: Script Automático (Recomendado) ⚡

Basta dar um duplo clique no arquivo:

```
start.bat
```

Isso abrirá **duas janelas**:
- ✅ Backend (Node.js) na porta 3000
- ✅ Frontend (React) na porta 5173

### Opção 2: Comando NPM Único

Na raiz do projeto (`sefaz-app`):

```bash
npm install
npm start
```

### Opção 3: Manual (Duas Janelas Separadas)

**Terminal 1 - Backend:**
```bash
cd backend
node src/index.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 📋 Pré-requisitos

- **Node.js** 18+ instalado
- **NPM** ou **Yarn**
- **Certificado Digital A1** (.pfx) para homologação

---

## ⚙️ Configuração Inicial

### 1. Instalar Dependências

Na raiz do projeto:
```bash
npm run install-all
```

Ou manualmente:
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configurar Certificado Digital

Edite o arquivo `backend/.env`:

```bash
# Certificado Digital
CERT_PATH=C:/caminho/completo/certificado.pfx
CERT_PASSWORD=senha_do_certificado

# SEFAZ - Brasília/DF (Homologação)
SEFAZ_URL=https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao.asmx

# Servidor
PORT=3000
NODE_ENV=development
```

> 📖 Veja o guia completo em: `guia_certificado_sefaz.md`

---

## 🎯 Acessar o Sistema

Após iniciar, acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

---

## 📚 Funcionalidades

### ✅ Implementadas

- ✨ **Emissão de NFe** com formulário completo
- 📤 **Envio para SEFAZ** (homologação)
- 🔍 **Consulta de Status** de NFe enviada
- ❌ **Cancelamento de NFe** autorizada
- 📊 **Dashboard** com lista de notas
- 🎨 **Interface Premium** com gradientes animados
- ⚙️ **Página de Configuração** do certificado

### 🔧 Backend

- Geração de XML NFe (layout 4.00)
- Assinatura digital com certificado A1
- Comunicação SOAP com SEFAZ
- Parser de resposta XML
- Validação de dados

### 🎨 Frontend

- Design moderno com Tailwind CSS
- Componentes React reutilizáveis
- Animações e transições suaves
- Responsivo para mobile

---

## 📁 Estrutura do Projeto

```
sefaz-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── services/       # Serviços (XML, SOAP, Assinatura)
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   └── config/         # Configurações
│   ├── .env.example        # Exemplo de configuração
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas (Dashboard, Form, Config)
│   │   ├── index.css       # Estilos globais
│   │   └── App.jsx         # Componente principal
│   └── package.json
│
├── start.bat               # Script para iniciar tudo
├── package.json            # Scripts raiz
└── README.md               # Este arquivo
```

---

## 🔒 Segurança

> ⚠️ **IMPORTANTE**:
> - Nunca compartilhe seu certificado digital ou arquivo `.env`
> - Use sempre o ambiente de **homologação** para testes
> - Adicione `.env` e `*.pfx` ao `.gitignore`

---

## 📖 Documentação

- [Guia de Configuração do Certificado](guia_certificado_sefaz.md)
- [Configuração SEFAZ Brasília-DF](configuracao_sefaz_brasilia.md)
- [Walkthrough Completo](walkthrough.md)

---

## 🐛 Troubleshooting

### Erro: "Porta 3000 já em uso"

Mate o processo ou mude a porta no `.env`:
```bash
PORT=3001
```

### Erro: "Certificado não configurado"

1. Verifique se o arquivo `.env` existe em `backend/`
2. Confirme se `CERT_PATH` e `CERT_PASSWORD` estão corretos
3. Reinicie o backend

### Frontend não carrega

1. Verifique se o backend está rodando
2. Confirme se a porta 5173 está livre
3. Limpe o cache: `cd frontend && npm run dev -- --force`

---

## 📞 Suporte

- **Portal NFe**: http://www.nfe.fazenda.gov.br/
- **SEFAZ-DF**: https://www.fazenda.df.gov.br/
- **Web Services**: http://www.nfe.fazenda.gov.br/portal/webServices.aspx

---

## 📝 Licença

MIT License - Livre para uso e modificação.
