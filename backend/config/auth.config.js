module.exports = {
    secret: process.env.JWT_SECRET || "seu-segredo-super-secreto",
    jwtExpiration: 86400, // 24 hours in seconds
    jwtRefreshExpiration: 604800, // 7 days in seconds
  };