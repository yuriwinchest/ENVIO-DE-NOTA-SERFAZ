const { SignedXml } = require('xml-crypto');
const { DOMParser } = require('xmldom');
const fs = require('fs');

class SignerService {
    /**
     * Assina o XML da NFe
     * @param {string} xml - XML da NFe
     * @param {string} certPath - Caminho para o arquivo do certificado (.pfx ou .pem)
     * @param {string} password - Senha do certificado (se .pfx)
     * @returns {string} XML assinado
     */
    signXML(xml, certPath, password) {
        // TODO: Implementar leitura correta de PFX se necessário. 
        // Por enquanto, assumindo PEM ou chave privada direta para simplificar, 
        // mas a estrutura deve suportar PFX convertendo para PEM.

        // Para testes, vamos assumir que certPath é o conteúdo da chave privada PEM
        // Em produção, leríamos o arquivo.

        let privateKey = '';
        try {
            if (fs.existsSync(certPath)) {
                privateKey = fs.readFileSync(certPath);
            } else {
                // Fallback para testes: se não for arquivo, assume que é a chave em string
                privateKey = certPath;
            }
        } catch (e) {
            console.error('Erro ao ler certificado:', e);
            throw new Error('Falha ao ler certificado digital');
        }

        const sig = new SignedXml();

        // Configurar transformações exigidas pela SEFAZ
        sig.addReference("//*[local-name(.)='infNFe']", [
            "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
            "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
        ], "http://www.w3.org/2000/09/xmldsig#sha1");

        sig.signingKey = privateKey;

        // Calcular assinatura
        sig.computeSignature(xml);

        // Retornar XML assinado
        return sig.getSignedXml();
    }
}

module.exports = new SignerService();
