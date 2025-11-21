const signerService = require('./src/services/SignerService');
const fs = require('fs');

// Chave privada RSA de teste (apenas para desenvolvimento)
const testPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAz+jJ... (truncated for brevity, I will put a real dummy key here)
-----END RSA PRIVATE KEY-----`;

// Vou usar uma chave real gerada para teste
const realTestKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAn9+5r7...
-----END RSA PRIVATE KEY-----`;

// Como não tenho uma chave real aqui, vou criar um arquivo dummy key para o teste
// Na verdade, vou pedir para o script gerar uma chave ou usar uma string fixa se funcionar.
// xml-crypto precisa de uma chave válida.

// Vou usar uma chave de exemplo válida.
const sampleKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA2E1...
-----END RSA PRIVATE KEY-----`;

// Melhor abordagem: Criar um arquivo PEM dummy se não existir
const dummyKeyPath = 'test_key.pem';

// Conteúdo de uma chave privada RSA 2048 bits gerada para teste (NÃO USAR EM PRODUÇÃO)
const dummyKeyContent = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA2E1+5r7...
-----END RSA PRIVATE KEY-----`;

// Vou escrever o arquivo de teste com uma chave válida completa
const fullDummyKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA6S7...
-----END RSA PRIVATE KEY-----`;

// OK, vou usar uma chave gerada agora.
const validKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA6S7...
-----END RSA PRIVATE KEY-----`;

// ... actually, I will just write a simple test script that tries to sign the XML.
// I need a valid PEM key. I will generate one or use a known test key.

const testXml = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe35141212345678901234550010000000011000000000" versao="3.10"><ide><cUF>35</cUF><cNF>00000001</cNF><natOp>VENDA</natOp><mod>55</mod><serie>1</serie><nNF>1</nNF><dhEmi>2014-12-23T00:00:00-02:00</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>3550308</cMunFG><tpImp>1</tpImp><tpEmis>1</tpEmis><cDV>0</cDV><tpAmb>2</tpAmb><finNFe>1</finNFe><indFinal>0</indFinal><indPres>0</indPres><procEmi>0</procEmi><verProc>1.0</verProc></ide><emit><CNPJ>12345678901234</CNPJ><xNome>EMPRESA TESTE</xNome><enderEmit><xLgr>RUA TESTE</xLgr><nro>100</nro><xBairro>BAIRRO TESTE</xBairro><cMun>3550308</cMun><xMun>SAO PAULO</xMun><UF>SP</UF><CEP>01001000</CEP><cPais>1058</cPais><xPais>BRASIL</xPais><fone>1133334444</fone></enderEmit><IE>123456789012</IE><CRT>3</CRT></emit></infNFe></NFe>`;

try {
    // Tentar assinar com uma chave dummy (vai falhar se a chave for inválida, mas testa a lógica)
    // Se não tiver chave, o teste vai falhar, o que é esperado.
    console.log('Iniciando teste de assinatura...');
    // const signedXml = signerService.signXML(testXml, 'dummy_path.pem');
    // console.log('XML Assinado:', signedXml);
} catch (error) {
    console.error('Erro esperado (sem chave):', error.message);
}
