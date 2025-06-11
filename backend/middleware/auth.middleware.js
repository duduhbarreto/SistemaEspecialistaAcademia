const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];

  // Remove Bearer from string if present
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Nenhum token fornecido!'
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado!'
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const authMiddleware = {
  verifyToken: verifyToken
};

module.exports = authMiddleware;