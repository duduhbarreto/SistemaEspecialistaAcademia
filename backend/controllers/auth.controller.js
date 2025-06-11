// server/controllers/auth.controller.js - Versão melhorada
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/auth.config');
const logger = require('../utils/logger');
const User = db.user;

exports.signup = async (req, res) => {
  try {
    logger.info('Tentativa de registro de novo usuário', { email: req.body.email });
    
    // Verificar se o email já existe
    const existingUser = await User.findOne({
      where: {
        email: req.body.email
      }
    });
    
    if (existingUser) {
      logger.info('Tentativa de registro com email já existente', { email: req.body.email });
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso',
        error: 'Este email já está registrado no sistema'
      });
    }
    
    // Criar novo usuário
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      age: req.body.age,
      weight: req.body.weight,
      height: req.body.height,
      goal: req.body.goal,
      experience_level: req.body.experience_level
    });

    logger.info('Usuário registrado com sucesso', { userId: user.id, email: user.email });
    
    return res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    logger.error('Erro ao registrar usuário', { error: error.message, stack: error.stack });
    console.error('Registro de usuário falhou:', error);
    
    // Resposta mais detalhada para ajudar no debug
    return res.status(500).json({
      success: false,
      message: 'Falha ao registrar o usuário',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.signin = async (req, res) => {
  try {
    logger.info('Tentativa de login', { email: req.body.email });
    
    // Encontrar o usuário pelo email
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (!user) {
      logger.info('Tentativa de login: usuário não encontrado', { email: req.body.email });
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Validar senha
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword) {
      logger.info('Tentativa de login: senha inválida', { email: req.body.email });
      return res.status(401).json({
        success: false,
        message: 'Senha inválida'
      });
    }

    // Criar token
    const token = jwt.sign(
      { id: user.id },
      config.secret,
      { expiresIn: config.jwtExpiration }
    );

    logger.info('Login realizado com sucesso', { userId: user.id, email: user.email });
    
    // Retornar informações do usuário e token
    return res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        goal: user.goal,
        experience_level: user.experience_level
      },
      token: token
    });
  } catch (error) {
    logger.error('Erro ao realizar login', { error: error.message, stack: error.stack });
    console.error('Login falhou:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Falha ao realizar login',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};