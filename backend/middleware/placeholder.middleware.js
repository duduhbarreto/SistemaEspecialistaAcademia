// server/middleware/placeholder.middleware.js
const express = require('express');
const router = express.Router();

// Middleware para gerar imagens placeholder
router.get('/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  
  // Cria um SVG simples como placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="#888" text-anchor="middle" dominant-baseline="middle">
        ${width} x ${height}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;