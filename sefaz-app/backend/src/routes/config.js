const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');

// Configuração do multer para upload de certificado
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const certDir = path.join(__dirname, '../../certificados');
        try {
            await fs.mkdir(certDir, { recursive: true });
            cb(null, certDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        cb(null, 'certificado.pfx');
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.pfx') || file.originalname.endsWith('.p12')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .pfx ou .p12 são permitidos'));
        }
    }
});

// GET - Obter configuração atual
router.get('/config', async (req, res) => {
    try {
        const envPath = path.join(__dirname, '../../.env');
        let config = {
            certPath: '',
            certPassword: '',
            sefazUrl: '',
            hasCertificate: false
        };

        try {
            const envContent = await fs.readFile(envPath, 'utf-8');
            const lines = envContent.split('\n');

            lines.forEach(line => {
                if (line.startsWith('CERT_PATH=')) {
                    config.certPath = line.split('=')[1].trim();
                } else if (line.startsWith('CERT_PASSWORD=')) {
                    config.certPassword = '********'; // Não expor senha real
                } else if (line.startsWith('SEFAZ_URL=')) {
                    config.sefazUrl = line.split('=')[1].trim();
                }
            });

            // Verifica se o certificado existe
            if (config.certPath) {
                try {
                    await fs.access(config.certPath);
                    config.hasCertificate = true;
                } catch {
                    config.hasCertificate = false;
                }
            }
        } catch (error) {
            // .env não existe ainda
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Upload de certificado
router.post('/config/certificate', upload.single('certificate'), async (req, res) => {
    try {
        const certPath = path.join(__dirname, '../../certificados/certificado.pfx');

        res.json({
            success: true,
            message: 'Certificado enviado com sucesso',
            path: certPath
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Salvar configuração
router.post('/config', async (req, res) => {
    try {
        const { certPassword, sefazUrl } = req.body;
        const envPath = path.join(__dirname, '../../.env');
        const certPath = path.join(__dirname, '../../certificados/certificado.pfx');

        // Verifica se o certificado existe
        try {
            await fs.access(certPath);
        } catch {
            return res.status(400).json({ error: 'Certificado não encontrado. Faça o upload primeiro.' });
        }

        // Cria/atualiza o arquivo .env
        const envContent = `# Porta do servidor
PORT=3000
NODE_ENV=development

# SEFAZ - Brasília/DF (Homologação)
SEFAZ_URL=${sefazUrl}

# Certificado Digital A1
CERT_PATH=${certPath.replace(/\\/g, '/')}
CERT_PASSWORD=${certPassword}
`;

        await fs.writeFile(envPath, envContent, 'utf-8');

        res.json({
            success: true,
            message: 'Configuração salva com sucesso! As mudanças já estão ativas.'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Remover certificado
router.delete('/config/certificate', async (req, res) => {
    try {
        const certPath = path.join(__dirname, '../../certificados/certificado.pfx');

        try {
            await fs.unlink(certPath);
            res.json({ success: true, message: 'Certificado removido com sucesso' });
        } catch {
            res.status(404).json({ error: 'Certificado não encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
