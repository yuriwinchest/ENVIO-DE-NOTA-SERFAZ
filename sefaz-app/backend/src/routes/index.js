const express = require('express');
const router = express.Router();
const fs = require('fs');
const nfeController = require('../controllers/NFeController');
const env = require('../config/env');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

router.get('/health/config', (req, res) => {
  const certPath = env.sefaz.certPath;
  const snapshot = {
    port: env.port,
    nodeEnv: env.nodeEnv,
    sefaz: {
      url: env.sefaz.url,
      certPath: certPath,
      certPassword: env.sefaz.certPassword ? '********' : '',
      hasCertificate: certPath ? fs.existsSync(certPath) : false,
    },
  };
  res.json({ status: 'ok', timestamp: new Date().toISOString(), config: snapshot });
});

router.post('/nfe', (req, res) => nfeController.create(req, res));
router.get('/nfe', (req, res) => nfeController.list(req, res));
router.post('/nfe/:id/enviar', (req, res) => nfeController.enviarSefaz(req, res));
router.get('/nfe/:id/consultar', (req, res) => nfeController.consultarSefaz(req, res));
router.post('/nfe/:id/cancelar', (req, res) => nfeController.cancelarSefaz(req, res));

module.exports = router;
