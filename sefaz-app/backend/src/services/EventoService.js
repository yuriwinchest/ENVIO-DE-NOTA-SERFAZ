const xmlGenerator = require('../utils/XMLGenerator');
const signerService = require('./SignerService');
const env = require('../config/env');

class EventoService {
    /**
     * Gera XML de evento de cancelamento
     */
    gerarEventoCancelamento(chaveAcesso, nProt, justificativa, nSeqEvento = 1) {
        if (justificativa.length < 15) {
            throw new Error('Justificativa deve ter no mínimo 15 caracteres');
        }

        const dhEvento = new Date().toISOString();
        const tpEvento = '110111'; // Cancelamento
        const cOrgao = chaveAcesso.substring(0, 2); // UF da chave

        // ID do evento: "ID" + tpEvento + chNFe + nSeqEvento (2 dígitos)
        const idEvento = `ID${tpEvento}${chaveAcesso}${nSeqEvento.toString().padStart(2, '0')}`;

        const evento = {
            '@_versao': '1.00',
            '@_xmlns': 'http://www.portalfiscal.inf.br/nfe',
            infEvento: {
                '@_Id': idEvento,
                cOrgao: cOrgao,
                tpAmb: '2', // Homologação
                CNPJ: chaveAcesso.substring(6, 20), // CNPJ do emitente
                chNFe: chaveAcesso,
                dhEvento: dhEvento,
                tpEvento: tpEvento,
                nSeqEvento: nSeqEvento.toString(),
                verEvento: '1.00',
                detEvento: {
                    '@_versao': '1.00',
                    descEvento: 'Cancelamento',
                    nProt: nProt,
                    xJust: justificativa
                }
            }
        };

        const xml = this.buildEventoXML(evento);

        // Assinar evento se certificado estiver configurado
        if (env.sefaz.certPath) {
            return signerService.signXML(xml, env.sefaz.certPath, env.sefaz.certPassword, 'infEvento');
        }

        return xml;
    }

    buildEventoXML(evento) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento versao="1.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <idLote>${Date.now()}</idLote>
  <evento versao="1.00">
    <infEvento Id="${evento.infEvento['@_Id']}">
      <cOrgao>${evento.infEvento.cOrgao}</cOrgao>
      <tpAmb>${evento.infEvento.tpAmb}</tpAmb>
      <CNPJ>${evento.infEvento.CNPJ}</CNPJ>
      <chNFe>${evento.infEvento.chNFe}</chNFe>
      <dhEvento>${evento.infEvento.dhEvento}</dhEvento>
      <tpEvento>${evento.infEvento.tpEvento}</tpEvento>
      <nSeqEvento>${evento.infEvento.nSeqEvento}</nSeqEvento>
      <verEvento>${evento.infEvento.verEvento}</verEvento>
      <detEvento versao="1.00">
        <descEvento>${evento.infEvento.detEvento.descEvento}</descEvento>
        <nProt>${evento.infEvento.detEvento.nProt}</nProt>
        <xJust>${evento.infEvento.detEvento.xJust}</xJust>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
    }
}

module.exports = new EventoService();
