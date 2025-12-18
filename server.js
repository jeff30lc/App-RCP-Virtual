
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir arquivos estáticos da raiz
app.use(express.static(__dirname));

// Rota principal para o SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`LifeSaver Pro rodando em http://localhost:${port}`);
});
