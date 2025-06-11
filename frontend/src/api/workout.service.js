import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/workouts/';

class WorkoutService {
  async getAll() {
    try {
      console.log('Making request to:', API_URL);
      console.log('Headers:', authHeader());
      
      const response = await axios.get(API_URL, { headers: authHeader() });
      console.log('Workout API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAll():', error);
      // Retornar um objeto estruturado mesmo em caso de erro
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar treinos',
        error: error.message
      };
    }
  }

  async getOne(id) {
    try {
      console.log(`Getting workout ${id}`);
      const response = await axios.get(API_URL + id, { headers: authHeader() });
      console.log('GetOne response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getOne():', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar treino',
        error: error.message
      };
    }
  }

  async getRecommended() {
    try {
      console.log('Getting recommended workout');
      const response = await axios.get(API_URL + 'recommended', { headers: authHeader() });
      console.log('Recommended workout response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getRecommended():', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar treino recomendado',
        error: error.message
      };
    }
  }

  async create(workoutData) {
    try {
      const response = await axios.post(API_URL, workoutData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error in create():', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar treino',
        error: error.message
      };
    }
  }

  async update(id, workoutData) {
    try {
      const response = await axios.put(API_URL + id, workoutData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error in update():', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar treino',
        error: error.message
      };
    }
  }

  async delete(id) {
    try {
      const response = await axios.delete(API_URL + id, { headers: authHeader() });
      return response.data;
    } catch (error) {
      console.error('Error in delete():', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao excluir treino',
        error: error.message
      };
    }
  }
}

export default new WorkoutService();