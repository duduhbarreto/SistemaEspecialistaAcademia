import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../api/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setCurrentUser(response.user);
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error(response.message || 'Falha ao realizar login');
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao conectar ao servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        return true;
      } else {
        toast.error(response.message || 'Falha ao realizar cadastro');
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao conectar ao servidor');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    toast.info('Logout realizado com sucesso!');
  };

  const updateUserProfile = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify({
      ...currentUser,
      ...updatedUser
    }));
    setCurrentUser({
      ...currentUser,
      ...updatedUser
    });
    toast.success('Perfil atualizado com sucesso!');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        loading, 
        login, 
        register, 
        logout,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
