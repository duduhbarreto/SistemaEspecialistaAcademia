import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/history/';

class HistoryService {
  async getAll() {
    try {
      const response = await axios.get(API_URL, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getOne(id) {
    try {
      const response = await axios.get(API_URL + id, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getRecent(limit = 5) {
    try {
      const response = await axios.get(API_URL + 'recent?limit=' + limit, { headers: authHeader() });
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

  async create(historyData) {
    try {
      const response = await axios.post(API_URL, historyData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async update(id, historyData) {
    try {
      const response = await axios.put(API_URL + id, historyData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(API_URL + id, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Novo método para obter o próximo treino recomendado
  async getNextWorkout() {
    try {
      const response = await axios.get(API_URL + 'next-workout', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new HistoryService();