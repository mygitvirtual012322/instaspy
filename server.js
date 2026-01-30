const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

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
});
