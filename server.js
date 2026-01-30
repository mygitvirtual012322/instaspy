const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware para JSON
app.use(express.json());

// Proxy para API do Stalkea.ai
const STALKEA_BASE = 'https://stalkea.ai/api';

// API: Get IP
app.get('/api/get-ip.php', async (req, res) => {
    try {
        const response = await axios.get(`${STALKEA_BASE}/get-ip.php`, {
            headers: {
                'Referer': 'https://stalkea.ai/',
                'User-Agent': req.headers['user-agent']
            }
        });
        res.json(response.data);
    } catch (error) {
        res.json({ ip: req.ip || '127.0.0.1' });
    }
});

// API: Config
app.get('/api/config.php', async (req, res) => {
    try {
        const response = await axios.get(`${STALKEA_BASE}/config.php`, {
            headers: {
                'Referer': 'https://stalkea.ai/',
                'User-Agent': req.headers['user-agent']
            }
        });
        res.json(response.data);
    } catch (error) {
        res.json({
            status: 'success',
            data: {
                pixel_fb: '',
                gtm_id: '',
                checkout_url: 'cta.html'
            }
        });
    }
});

// API: Instagram
app.get('/api/instagram.php', async (req, res) => {
    try {
        const queryString = new URLSearchParams(req.query).toString();
        const url = `${STALKEA_BASE}/instagram.php${queryString ? '?' + queryString : ''}`;

        const response = await axios.get(url, {
            headers: {
                'Referer': 'https://stalkea.ai/',
                'User-Agent': req.headers['user-agent']
            }
        });

        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: `Erro ao conectar com API original. Código: ${error.response?.status || 500}`
        });
    }
});

// API: Leads (GET)
app.get('/api/leads.php', async (req, res) => {
    try {
        const queryString = new URLSearchParams(req.query).toString();
        const url = `${STALKEA_BASE}/leads.php${queryString ? '?' + queryString : ''}`;

        const response = await axios.get(url, {
            headers: {
                'Referer': 'https://stalkea.ai/',
                'User-Agent': req.headers['user-agent']
            }
        });

        res.json(response.data);
    } catch (error) {
        res.json({ success: true, searches_remaining: 999 });
    }
});

// API: Leads (POST)
app.post('/api/leads.php', async (req, res) => {
    try {
        const response = await axios.post(`${STALKEA_BASE}/leads.php`, req.body, {
            headers: {
                'Referer': 'https://stalkea.ai/',
                'User-Agent': req.headers['user-agent'],
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error) {
        res.json({ success: true, lead_id: 'demo_' + Date.now() });
    }
});

// Servir arquivos estáticos da pasta stalkea_clone
app.use(express.static(path.join(__dirname, 'stalkea_clone')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'stalkea_clone', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`🚀 Acesse: http://localhost:${PORT}`);
    console.log(`📡 Proxy para: ${STALKEA_BASE}`);
});
