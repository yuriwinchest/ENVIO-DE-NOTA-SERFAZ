const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function readEnv() {
  try {
    const envPath = path.join(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const buf = fs.readFileSync(envPath);
      return dotenv.parse(buf);
    }
  } catch (_) {}
  return {};
}

module.exports = {
  get port() {
    const e = readEnv();
    return e.PORT || process.env.PORT || 3000;
  },
  get nodeEnv() {
    const e = readEnv();
    return e.NODE_ENV || process.env.NODE_ENV || 'development';
  },
  sefaz: {
    get url() {
      const e = readEnv();
      return e.SEFAZ_URL || process.env.SEFAZ_URL || 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao.asmx';
    },
    get certPath() {
      const e = readEnv();
      return e.CERT_PATH || process.env.CERT_PATH || '';
    },
    get certPassword() {
      const e = readEnv();
      return e.CERT_PASSWORD || process.env.CERT_PASSWORD || '';
    },
    get certPfxBase64() {
      const e = readEnv();
      return e.CERT_PFX_BASE64 || process.env.CERT_PFX_BASE64 || '';
    }
  }
};
