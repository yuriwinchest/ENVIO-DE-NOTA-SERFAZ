const axios = require('axios');
const https = require('https');
const fs = require('fs');
const env = require('../config/env');

class SoapService {
    constructor() {}

    /**
     * Envia o XML assinado para autorização
     */
    async autorizarNFe(signedXml, idLote = '1') {
        const endpoint = env.sefaz.url + '/nfeautorizacao4.asmx';
        const envelope = this.buildAutorizacaoEnvelope(signedXml, idLote);
        return await this.sendSoapRequest(endpoint, envelope);
    }

    /**
     * Consulta o protocolo de uma NFe pela chave de acesso
     */
    async consultarNFe(chaveAcesso) {
        const endpoint = env.sefaz.url + '/nfeconsultaprotocolo4.asmx';
        const envelope = this.buildConsultaEnvelope(chaveAcesso);
        return await this.sendSoapRequest(endpoint, envelope);
    }

    /**
     * Envia evento de cancelamento
     */
    async cancelarNFe(eventoXml) {
        const endpoint = env.sefaz.url + '/recepcaoevento4.asmx';
        const envelope = this.buildEventoEnvelope(eventoXml);
        return await this.sendSoapRequest(endpoint, envelope);
    }

    buildAutorizacaoEnvelope(xml, idLote) {
        const cleanXml = xml.replace(/<\?xml.*?\?>/, '');
        return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
      <enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <idLote>${idLote}</idLote>
        <indSinc>1</indSinc>
        ${cleanXml}
      </enviNFe>
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
    }

    buildConsultaEnvelope(chaveAcesso) {
        return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">
      <consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <tpAmb>2</tpAmb>
        <xServ>CONSULTAR</xServ>
        <chNFe>${chaveAcesso}</chNFe>
      </consSitNFe>
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
    }

    buildEventoEnvelope(eventoXml) {
        const cleanXml = eventoXml.replace(/<\?xml.*?\?>/, '');
        return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeRecepcaoEvento4">
      ${cleanXml}
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`;
    }

    async sendSoapRequest(endpoint, envelope) {
        const httpsAgent = this.getHttpsAgent();

        try {
            const response = await axios.post(endpoint, envelope, {
                headers: {
                    'Content-Type': 'application/soap+xml; charset=utf-8',
                },
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            return response.data;
        } catch (error) {
            console.error('Erro na comunicação SOAP:', error.message);
            if (error.response) {
                console.error('Dados do erro:', error.response.data);
                throw new Error(`Erro SEFAZ: ${error.response.status} - ${error.response.data}`);
            }
            throw error;
        }
    }

    getHttpsAgent() {
        if (!env.sefaz.certPath) {
            console.warn('AVISO: Certificado não configurado. A comunicação SSL com a SEFAZ falhará.');
            return new https.Agent({ rejectUnauthorized: false });
        }

        try {
            const pfx = fs.readFileSync(env.sefaz.certPath);
            return new https.Agent({
                pfx: pfx,
                passphrase: env.sefaz.certPassword,
                rejectUnauthorized: false
            });
        } catch (e) {
            console.error('Erro ao carregar certificado para SSL:', e);
            throw new Error('Falha ao carregar certificado digital para comunicação HTTPS');
        }
    }
}

module.exports = new SoapService();
