const nfeService = require('./src/services/NFeService');
const data = require('./test_nfe_complex.json');
const fs = require('fs');

try {
    console.log('Iniciando teste local...');
    const nfe = nfeService.gerarNFe(data);
    console.log('NFe gerada com sucesso.');

    // Gerar XML (opcional, mas bom para ver erro)
    const xmlGenerator = require('./src/utils/XMLGenerator');
    const xml = xmlGenerator.generateXML(nfe);
    fs.writeFileSync('complex_nfe_local.xml', xml);
    console.log('XML salvo em complex_nfe_local.xml');

} catch (error) {
    console.error('Erro no teste local:', error);
}
