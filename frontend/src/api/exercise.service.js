import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/exercises/';

class ExerciseService {
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

  async getByMuscleGroup(muscleGroupId) {
    try {
      const response = await axios.get(API_URL + 'muscle-group/' + muscleGroupId, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getByDifficulty(difficulty) {
    try {
      const response = await axios.get(API_URL + 'difficulty/' + difficulty, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMuscleGroups() {
    try {
      const response = await axios.get('/api/muscle-groups', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async create(exerciseData) {
    try {
      const response = await axios.post(API_URL, exerciseData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async update(id, exerciseData) {
    try {
      const response = await axios.put(API_URL + id, exerciseData, { headers: authHeader() });
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
}

export default new ExerciseService();