const nfeService = require('../services/NFeService');
const xmlGenerator = require('../utils/XMLGenerator');
const soapService = require('../services/SoapService');
const responseParser = require('../services/SefazResponseParser');
const eventoService = require('../services/EventoService');

const env = require('../config/env');
const signerService = require('../services/SignerService');

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.json');

class NFeController {
    constructor() {
        this.db = this.loadDb();
    }

    loadDb() {
        try {
            if (!fs.existsSync(DB_PATH)) {
                fs.writeFileSync(DB_PATH, JSON.stringify({ nfes: [] }));
            }
            return JSON.parse(fs.readFileSync(DB_PATH));
        } catch (e) {
            console.error('Erro ao carregar DB:', e);
            return { nfes: [] };
        }
    }

    saveDb() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.db, null, 2));
        } catch (e) {
            console.error('Erro ao salvar DB:', e);
        }
    }

    async create(req, res) {
        try {
            const data = req.body;
            const nfe = nfeService.gerarNFe(data);

            const nfeRecord = {
                id: Date.now().toString(),
                nNF: nfe.infNFe.ide.nNF,
                serie: nfe.infNFe.ide.serie,
                dhEmi: nfe.infNFe.ide.dhEmi,
                dest: nfe.infNFe.dest.xNome,
                valor: nfe.infNFe.total.ICMSTot.vNF,
                status: 'GERADA',
                xml: null,
                signed: false,
                chaveAcesso: null,
                protocolo: null,
                motivoRejeicao: null,
                dhRecbto: null
            };

            if (req.query.format === 'xml') {
                let xml = xmlGenerator.generateXML(nfe);

                if (env.sefaz.certPath) {
                    try {
                        xml = signerService.signXML(xml, env.sefaz.certPath, env.sefaz.certPassword);
                        nfeRecord.signed = true;
                        nfeRecord.status = 'ASSINADA';
                    } catch (signError) {
                        console.error('Erro ao assinar XML:', signError);
                        return res.status(500).json({ error: 'Erro ao assinar XML', details: signError.message });
                    }
                }

                nfeRecord.xml = xml;
                this.db.nfes.push(nfeRecord);
                this.saveDb();

                res.set('Content-Type', 'application/xml');
                return res.send(xml);
            }

            this.db.nfes.push(nfeRecord);
            this.saveDb();
            res.json(nfe);
        } catch (error) {
            console.error('Erro ao gerar NFe:', error);
            res.status(500).json({ error: 'Erro ao gerar NFe', details: error.message });
        }
    }

    async enviarSefaz(req, res) {
        try {
            const { id } = req.params;

            const nfe = this.db.nfes.find(n => n.id === id);
            if (!nfe) {
                return res.status(404).json({ error: 'NFe não encontrada' });
            }

            if (!nfe.signed) {
                return res.status(400).json({ error: 'NFe não está assinada' });
            }

            if (!env.sefaz.certPath) {
                return res.status(400).json({ error: 'Certificado digital não configurado' });
            }

            const idLote = Date.now().toString();
            const respostaXml = await soapService.autorizarNFe(nfe.xml, idLote);

            // Parsear resposta
            const resposta = responseParser.parseAutorizacaoResponse(respostaXml);

            // Atualizar NFe com dados da resposta
            nfe.status = resposta.status;
            nfe.dhRecbto = resposta.dhRecbto;

            if (resposta.protNFe) {
                nfe.chaveAcesso = resposta.protNFe.chNFe;
                nfe.protocolo = resposta.protNFe.nProt;
            }

            if (resposta.status === 'REJEITADA') {
                nfe.motivoRejeicao = `${resposta.cStat} - ${resposta.xMotivo}`;
            }

            this.saveDb();

            res.json({
                success: responseParser.isSuccess(resposta.cStat),
                nfe: nfe,
                resposta: {
                    cStat: resposta.cStat,
                    xMotivo: resposta.xMotivo,
                    chaveAcesso: resposta.protNFe?.chNFe,
                    protocolo: resposta.protNFe?.nProt
                }
            });
        } catch (error) {
            console.error('Erro ao enviar para SEFAZ:', error);

            const nfe = this.db.nfes.find(n => n.id === req.params.id);
            if (nfe) {
                nfe.status = 'ERRO_ENVIO';
                nfe.motivoRejeicao = error.message;
                this.saveDb();
            }

            res.status(500).json({
                error: 'Erro ao enviar para SEFAZ',
                details: error.message
            });
        }
    }

    async consultarSefaz(req, res) {
        try {
            const { id } = req.params;

            const nfe = this.db.nfes.find(n => n.id === id);
            if (!nfe) {
                return res.status(404).json({ error: 'NFe não encontrada' });
            }

            if (!nfe.chaveAcesso) {
                return res.status(400).json({ error: 'NFe não possui chave de acesso' });
            }

            if (!env.sefaz.certPath) {
                return res.status(400).json({ error: 'Certificado digital não configurado' });
            }

            const respostaXml = await soapService.consultarNFe(nfe.chaveAcesso);
            const resposta = responseParser.parseConsultaResponse(respostaXml);

            // Atualizar status se mudou
            if (resposta.status !== nfe.status) {
                nfe.status = resposta.status;
                nfe.dhRecbto = resposta.dhRecbto;

                if (resposta.protNFe) {
                    nfe.protocolo = resposta.protNFe.nProt;
                }

                this.saveDb();
            }

            res.json({
                success: true,
                nfe: nfe,
                resposta: {
                    cStat: resposta.cStat,
                    xMotivo: resposta.xMotivo,
                    protocolo: resposta.protNFe?.nProt
                }
            });
        } catch (error) {
            console.error('Erro ao consultar SEFAZ:', error);
            res.status(500).json({
                error: 'Erro ao consultar SEFAZ',
                details: error.message
            });
        }
    }

    async cancelarSefaz(req, res) {
        try {
            const { id } = req.params;
            const { justificativa } = req.body;

            if (!justificativa || justificativa.length < 15) {
                return res.status(400).json({ error: 'Justificativa deve ter no mínimo 15 caracteres' });
            }

            const nfe = this.db.nfes.find(n => n.id === id);
            if (!nfe) {
                return res.status(404).json({ error: 'NFe não encontrada' });
            }

            if (nfe.status !== 'AUTORIZADA') {
                return res.status(400).json({ error: 'Apenas NFe AUTORIZADA pode ser cancelada' });
            }

            if (!nfe.chaveAcesso || !nfe.protocolo) {
                return res.status(400).json({ error: 'NFe não possui chave de acesso ou protocolo' });
            }

            if (!env.sefaz.certPath) {
                return res.status(400).json({ error: 'Certificado digital não configurado' });
            }

            // Gerar XML de cancelamento
            const eventoXml = eventoService.gerarEventoCancelamento(
                nfe.chaveAcesso,
                nfe.protocolo,
                justificativa
            );

            // Enviar para SEFAZ
            const respostaXml = await soapService.cancelarNFe(eventoXml);
            const resposta = responseParser.parseEventoResponse(respostaXml);

            // Atualizar NFe
            if (responseParser.isSuccess(resposta.cStat)) {
                nfe.status = 'CANCELADA';
                nfe.motivoRejeicao = null;
            } else {
                nfe.motivoRejeicao = `${resposta.cStat} - ${resposta.xMotivo}`;
            }

            this.saveDb();

            res.json({
                success: responseParser.isSuccess(resposta.cStat),
                nfe: nfe,
                resposta: {
                    cStat: resposta.cStat,
                    xMotivo: resposta.xMotivo
                }
            });
        } catch (error) {
            console.error('Erro ao cancelar NFe:', error);
            res.status(500).json({
                error: 'Erro ao cancelar NFe',
                details: error.message
            });
        }
    }

    async list(req, res) {
        this.db = this.loadDb();
        res.json(this.db.nfes.reverse());
    }
}

module.exports = new NFeController();
