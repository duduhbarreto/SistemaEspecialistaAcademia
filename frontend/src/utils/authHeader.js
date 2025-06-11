export default function authHeader() {
  const token = localStorage.getItem('token');

  if (token) {
    // Logar para depuração
    console.log('Token found in localStorage');
    return { 
      'Authorization': `Bearer ${token}`,
      // Adicione headers adicionais que possam ser necessários
      'Content-Type': 'application/json'
    };
  } else {
    console.warn('No token found in localStorage');
    return {
      'Content-Type': 'application/json'
    };
  }
}