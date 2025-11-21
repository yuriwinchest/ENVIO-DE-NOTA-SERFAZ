# Integração SEFAZ – NFe (v4.00)

Este documento descreve a linguagem, tecnologias e métodos utilizados para gerar, assinar e enviar a Nota Fiscal Eletrônica (NFe) para a SEFAZ, além de como as respostas são tratadas e como o sistema é configurado para homologação e produção.

## Visão Geral

- Aplicação full-stack para emissão de NFe (layout 4.00), com envio via web services da SEFAZ (modelo SOAP).
- Utiliza certificado digital A1 (`.pfx`) para assinatura do XML e autenticação TLS mútua na comunicação.
- Disponibiliza API REST para criar, assinar, enviar, consultar e cancelar NFe, com interface web para operação.

## Linguagens e Tecnologias

- Backend: Node.js 18+ (JavaScript) com Express (`backend/src/app.js:1`).
- Frontend: React + Vite + Tailwind CSS (interface para emissão e configuração).
- XML: `xmlbuilder2` para gerar o XML da NFe (`backend/src/utils/XMLGenerator.js:1`).
- Assinatura digital: `xml-crypto` para assinar o elemento `infNFe` conforme exigência da SEFAZ (`backend/src/services/SignerService.js:1`, `backend/src/services/SignerService.js:36`).
- SOAP/HTTPS: `axios` + `https.Agent` com cliente TLS carregando `.pfx` e `passphrase` (`backend/src/services/SoapService.js:1`, `backend/src/services/SoapService.js:102`).
- Parser de resposta: `fast-xml-parser` para interpretar envelopes SOAP da SEFAZ (`backend/src/services/SefazResponseParser.js:1`).

## Arquitetura

- Backend expõe rotas REST que orquestram:
  - Geração do XML (NFe v4.00) (`backend/src/utils/XMLGenerator.js:6`).
  - Assinatura do XML com certificado A1 (`backend/src/controllers/NFeController.js:56`).
  - Envio do XML assinado à SEFAZ via SOAP (`backend/src/controllers/NFeController.js:92`).
  - Consulta de protocolo e eventos (cancelamento) via SOAP (`backend/src/controllers/NFeController.js:157`, `backend/src/services/SoapService.js:27`).
- Variáveis de ambiente carregadas de `.env` controlam URL da SEFAZ e certificado (`backend/src/config/env.js:19`).

## Fluxo de Integração SEFAZ

- Geração: A API monta o objeto NFe e gera o XML no layout 4.00 usando `xmlbuilder2` (`backend/src/utils/XMLGenerator.js:6`, `backend/src/utils/XMLGenerator.js:21`).
- Assinatura: O XML é assinado no nó `infNFe` com `xml-crypto` e chave do certificado A1 (`backend/src/services/SignerService.js:36`).
- Envio: O XML assinado é envelopado em SOAP e enviado ao endpoint de autorização (`NFeAutorizacao4`) com `axios` e `https.Agent` (cliente TLS com `.pfx`) (`backend/src/services/SoapService.js:12`, `backend/src/services/SoapService.js:50`, `backend/src/services/SoapService.js:102`).
- Resposta: O retorno SOAP é parseado para extrair `cStat`, `xMotivo`, protocolo e chave de acesso (`backend/src/services/SefazResponseParser.js:18`, `backend/src/services/SefazResponseParser.js:31`).
- Consulta e Cancelamento: Fluxos análogos com `NFeConsultaProtocolo4` e `RecepcaoEvento4` (`backend/src/services/SoapService.js:18`, `backend/src/services/SoapService.js:27`, `backend/src/services/SoapService.js:67`, `backend/src/services/EventoService.js:53`).

## Web Services SEFAZ Utilizados

- Autorização: `.../nfeautorizacao4.asmx` (ação `NFeAutorizacao4`) (`backend/src/services/SoapService.js:12`).
- Consulta de Protocolo: `.../nfeconsultaprotocolo4.asmx` (`backend/src/services/SoapService.js:18`).
- Recepção de Eventos (Cancelamento): `.../recepcaoevento4.asmx` (`backend/src/services/SoapService.js:27`).
- A URL base é configurável via `.env` (ex.: SVRS homologação) (`backend/src/config/env.js:19`).

## Configuração

- Arquivo `.env` no `backend`:
  - `SEFAZ_URL`: URL do web service SEFAZ (homologação/produção).
  - `CERT_PATH`: caminho absoluto do certificado A1 `.pfx`.
  - `CERT_PASSWORD`: senha do certificado A1.
  - `PORT`, `NODE_ENV`.
  - Carregamento e uso em tempo de execução (`backend/src/config/env.js:19`, `backend/src/routes/config.js:101`).
- Interface de Configuração: Upload do certificado, senha e URL, com persistência automática no `.env` (`backend/src/routes/config.js:95`, `frontend/src/pages/ConfigPage.jsx:270`).

## Assinatura Digital

- O elemento `infNFe` é referenciado com transformações exigidas:
  - `enveloped-signature` e canonicalização `c14n`.
  - Algoritmo `sha1` conforme compatibilidade das implementações SEFAZ (`backend/src/services/SignerService.js:36`).
- O XML assinado é persistido e marcado como `ASSINADA` antes do envio (`backend/src/controllers/NFeController.js:56`).

## Segurança

- Certificado A1 `.pfx` protegido por `passphrase`; nunca versionado nem exposto.
- TLS mútua na camada HTTPS com cliente carregando `pfx` e `passphrase` (`backend/src/services/SoapService.js:102`).
- Sanitização e sigilo de `CERT_PASSWORD` em endpoints de saúde (`backend/src/routes/index.js:14`).

## Endpoints da API (Interna)

- `POST /api/nfe`: Gera NFe (opcional `?format=xml` para retorno do XML) (`backend/src/controllers/NFeController.js:32`).
- `POST /api/nfe/:id/enviar`: Envia NFe assinada para SEFAZ (`backend/src/controllers/NFeController.js:92`).
- `GET /api/nfe/:id/consultar`: Consulta status/protocolo da NFe (`backend/src/controllers/NFeController.js:157`).
- `POST /api/nfe/:id/cancelar`: Gera evento de cancelamento e envia à SEFAZ (`backend/src/services/SoapService.js:27`, `backend/src/services/EventoService.js:53`).

## Tratamento de Respostas

- Parser mapeia `cStat`, `xMotivo`, protocolo (`nProt`), chave (`chNFe`) e data de recebimento (`dhRecbto`) (`backend/src/services/SefazResponseParser.js:31`, `backend/src/services/SefazResponseParser.js:45`).
- Estado da NFe atualizado para `AUTORIZADA`, `REJEITADA`, etc., conforme retorno (`backend/src/controllers/NFeController.js:108`).

## Requisitos e Ambiente

- Node.js 18+, NPM/Yarn.
- Certificado Digital A1 válido (homologação/produção).
- Acesso aos web services SEFAZ (ex.: SVRS para DF homologação).
- Portas: Backend `3000`, Frontend `5173` (ajustáveis).
- Inicialização rápida via `start.bat` ou `npm start` na raiz (`sefaz-app/README.md:5`, `sefaz-app/package.json:5`).

## Referências de Código

- Geração XML NFe v4.00: `backend/src/utils/XMLGenerator.js:6`, `backend/src/utils/XMLGenerator.js:21`.
- Assinatura infNFe: `backend/src/services/SignerService.js:36`.
- SOAP envelopes (Autorização/Consulta/Evento): `backend/src/services/SoapService.js:50`, `backend/src/services/SoapService.js:67`.
- HTTPS com `.pfx`: `backend/src/services/SoapService.js:102`.
- Rotas API: `backend/src/routes/index.js:21`.
- Controller de envio: `backend/src/controllers/NFeController.js:92`.
- Parser de resposta: `backend/src/services/SefazResponseParser.js:18`.

## Links Oficiais

- Portal NFe: `http://www.nfe.fazenda.gov.br/`
- Web Services: `http://www.nfe.fazenda.gov.br/portal/webServices.aspx`