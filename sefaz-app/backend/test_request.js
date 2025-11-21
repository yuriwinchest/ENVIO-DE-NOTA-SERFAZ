const axios = require('axios');
const fs = require('fs');
const data = require('./test_nfe_complex.json');

const API_URL = 'http://localhost:3001/api/nfe?format=xml';

console.log(`Enviando requisição para ${API_URL}...`);

axios.post(API_URL, data, {
    headers: { 'Content-Type': 'application/json' }
})
    .then(res => {
        fs.writeFileSync('complex_nfe_signed.xml', res.data);
        console.log('XML salvo em complex_nfe_signed.xml');
        console.log('Conteúdo (primeiros 200 chars):', res.data.substring(0, 200));
    })
    .catch(err => {
        console.error('Erro na requisição:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Dados do erro:', JSON.stringify(err.response.data, null, 2));
        } else if (err.request) {
            console.error('Sem resposta do servidor. O servidor está rodando na porta 3001?');
        }
    });
