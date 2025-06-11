import axios from 'axios';

const API_URL = '/api/auth/';

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(API_URL + 'signin', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(API_URL + 'signup', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        goal: userData.goal,
        experience_level: userData.experience_level
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
}

export default new AuthService();