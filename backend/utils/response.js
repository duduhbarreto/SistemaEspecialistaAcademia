/**
 * Standard API response utility
 */

// Success response
exports.success = (res, data = {}, message = 'Operação realizada com sucesso', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      ...data
    });
  };
  
  // Error response
  exports.error = (res, message = 'Ocorreu um erro', error = null, statusCode = 500) => {
    const response = {
      success: false,
      message
    };
  
    // Only include error details in development environment
    if (process.env.NODE_ENV === 'development' && error) {
      response.error = error.toString();
    }
  
    return res.status(statusCode).json(response);
  };
  
  // Not found response
  exports.notFound = (res, message = 'Recurso não encontrado') => {
    return res.status(404).json({
      success: false,
      message
    });
  };
  
  // Bad request response
  exports.badRequest = (res, message = 'Requisição inválida', errors = null) => {
    const response = {
      success: false,
      message
    };
  
    if (errors) {
      response.errors = errors;
    }
  
    return res.status(400).json(response);
  };
  
  // Unauthorized response
  exports.unauthorized = (res, message = 'Não autorizado') => {
    return res.status(401).json({
      success: false,
      message
    });
  };
  
  // Forbidden response
  exports.forbidden = (res, message = 'Acesso negado') => {
    return res.status(403).json({
      success: false,
      message
    });
  };