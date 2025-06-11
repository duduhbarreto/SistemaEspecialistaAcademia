import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/users/';

class UserService {
  async getProfile() {
    try {
      const response = await axios.get(API_URL + 'profile', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userData) {
    try {
      const response = await axios.put(API_URL + 'profile', userData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await axios.get(API_URL + 'stats', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await axios.post(API_URL + 'change-password', passwordData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateEmail(emailData) {
    try {
      const response = await axios.post(API_URL + 'update-email', emailData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePersonalInfo(userData) {
    try {
      const response = await axios.put(API_URL + 'personal-info', userData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteAccount(passwordData) {
    try {
      const response = await axios.post(API_URL + 'delete-account', passwordData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}


export default new UserService();