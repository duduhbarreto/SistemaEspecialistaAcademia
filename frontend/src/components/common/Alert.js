import React from 'react';
import { Alert as BootstrapAlert } from 'react-bootstrap';

const Alert = ({ variant, message, onClose }) => {
  if (!message) return null;
  
  return (
    <BootstrapAlert 
      variant={variant || 'info'} 
      dismissible={!!onClose}
      onClose={onClose}
      className="my-3"
    >
      {message}
    </BootstrapAlert>
  );
};

export default Alert;