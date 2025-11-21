const { XMLParser } = require('fast-xml-parser');

class SefazResponseParser {
    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_'
        });
    }

    /**
     * Parseia a resposta de autorização de NFe
     * @param {string} xmlResponse - XML de resposta da SEFAZ
     * @returns {Object} Dados estruturados da resposta
     */
    parseAutorizacaoResponse(xmlResponse) {
        try {
            const parsed = this.parser.parse(xmlResponse);

            // Navegar pela estrutura SOAP
            const envelope = parsed['soap12:Envelope'] || parsed['soap:Envelope'] || parsed;
            const body = envelope['soap12:Body'] || envelope['soap:Body'] || envelope;
            const response = body.nfeResultMsg || body;
            const retEnviNFe = response.retEnviNFe || response;

            const result = {
                cStat: retEnviNFe.cStat,
                xMotivo: retEnviNFe.xMotivo,
                cUF: retEnviNFe.cUF,
                dhRecbto: retEnviNFe.dhRecbto,
                tpAmb: retEnviNFe.tpAmb,
                verAplic: retEnviNFe.verAplic,
                nRec: retEnviNFe.infRec?.nRec,
                protNFe: null,
                status: this.mapStatus(retEnviNFe.cStat)
            };

            // Se houver protocolo de autorização
            if (retEnviNFe.protNFe) {
                const infProt = retEnviNFe.protNFe.infProt;
                result.protNFe = {
                    tpAmb: infProt.tpAmb,
                    verAplic: infProt.verAplic,
                    chNFe: infProt.chNFe,
                    dhRecbto: infProt.dhRecbto,
                    nProt: infProt.nProt,
                    digVal: infProt.digVal,
                    cStat: infProt.cStat,
                    xMotivo: infProt.xMotivo
                };
            }

            return result;
        } catch (error) {
            console.error('Erro ao parsear resposta da SEFAZ:', error);
            throw new Error('Falha ao processar resposta da SEFAZ');
        }
    }

    /**
     * Parseia resposta de consulta de protocolo
     * @param {string} xmlResponse - XML de resposta
     * @returns {Object} Dados da consulta
     */
    parseConsultaResponse(xmlResponse) {
        try {
            const parsed = this.parser.parse(xmlResponse);

            const envelope = parsed['soap12:Envelope'] || parsed['soap:Envelope'] || parsed;
            const body = envelope['soap12:Body'] || envelope['soap:Body'] || envelope;
            const response = body.nfeResultMsg || body;
            const retConsSitNFe = response.retConsSitNFe || response;

            const result = {
                cStat: retConsSitNFe.cStat,
                xMotivo: retConsSitNFe.xMotivo,
                cUF: retConsSitNFe.cUF,
                dhRecbto: retConsSitNFe.dhRecbto,
                chNFe: retConsSitNFe.chNFe,
                protNFe: null,
                status: this.mapStatus(retConsSitNFe.cStat)
            };

            if (retConsSitNFe.protNFe) {
                const infProt = retConsSitNFe.protNFe.infProt;
                result.protNFe = {
                    tpAmb: infProt.tpAmb,
                    verAplic: infProt.verAplic,
                    chNFe: infProt.chNFe,
                    dhRecbto: infProt.dhRecbto,
                    nProt: infProt.nProt,
                    cStat: infProt.cStat,
                    xMotivo: infProt.xMotivo
                };
            }

            return result;
        } catch (error) {
            console.error('Erro ao parsear consulta:', error);
            throw new Error('Falha ao processar consulta');
        }
    }

    /**
     * Parseia resposta de evento (cancelamento, carta de correção, etc)
     * @param {string} xmlResponse - XML de resposta
     * @returns {Object} Dados do evento
     */
    parseEventoResponse(xmlResponse) {
        try {
            const parsed = this.parser.parse(xmlResponse);

            const envelope = parsed['soap12:Envelope'] || parsed['soap:Envelope'] || parsed;
            const body = envelope['soap12:Body'] || envelope['soap:Body'] || envelope;
            const response = body.nfeResultMsg || body;
            const retEnvEvento = response.retEnvEvento || response;

            const result = {
                cStat: retEnvEvento.cStat,
                xMotivo: retEnvEvento.xMotivo,
                cOrgao: retEnvEvento.cOrgao,
                tpAmb: retEnvEvento.tpAmb,
                verAplic: retEnvEvento.verAplic,
                retEvento: null,
                status: this.mapStatus(retEnvEvento.cStat)
            };

            if (retEnvEvento.retEvento) {
                const infEvento = retEnvEvento.retEvento.infEvento;
                result.retEvento = {
                    tpAmb: infEvento.tpAmb,
                    verAplic: infEvento.verAplic,
                    cOrgao: infEvento.cOrgao,
                    cStat: infEvento.cStat,
                    xMotivo: infEvento.xMotivo,
                    chNFe: infEvento.chNFe,
                    tpEvento: infEvento.tpEvento,
                    xEvento: infEvento.xEvento,
                    nSeqEvento: infEvento.nSeqEvento,
                    dhRegEvento: infEvento.dhRegEvento,
                    nProt: infEvento.nProt
                };
            }

            return result;
        } catch (error) {
            console.error('Erro ao parsear evento:', error);
            throw new Error('Falha ao processar evento');
        }
    }

    /**
     * Mapeia código de status para estado da aplicação
     * @param {string} cStat - Código de status da SEFAZ
     * @returns {string} Status mapeado
     */
    mapStatus(cStat) {
        const statusMap = {
            '100': 'AUTORIZADA',
            '101': 'CANCELADA',
            '102': 'INUTILIZADA',
            '110': 'DENEGADA',
            '135': 'EVENTO_REGISTRADO',
            '136': 'EVENTO_REGISTRADO',
            '150': 'AUTORIZADA',
            '151': 'CANCELADA',
            '204': 'DUPLICIDADE',
            '539': 'REJEITADA'
        };

        // Códigos 2XX geralmente são rejeições
        if (cStat.startsWith('2') || cStat.startsWith('3') || cStat.startsWith('4') || cStat.startsWith('5')) {
            return 'REJEITADA';
        }

        return statusMap[cStat] || 'PROCESSANDO';
    }

    /**
     * Verifica se a resposta indica sucesso
     * @param {string} cStat - Código de status
     * @returns {boolean}
     */
    isSuccess(cStat) {
        return ['100', '101', '135', '136', '150', '151'].includes(cStat);
    }
}

module.exports = new SefazResponseParser();
