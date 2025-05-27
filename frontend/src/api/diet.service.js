// frontend/src/api/diet.service.js
import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/diet/';

class DietService {
  async calculateDiet(activityLevel, gender, dietApproach = 'automatic') {
    try {
      const response = await axios.post(API_URL + 'calculate', 
        { 
          activity_level: activityLevel, 
          gender: gender,
          diet_approach: dietApproach 
        }, 
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async getDiet() {
    try {
      const response = await axios.get(API_URL, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async getFoodSuggestions() {
    try {
      const response = await axios.get(API_URL + 'food-suggestions', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async addRestriction(restrictionData) {
    try {
      const response = await axios.post(API_URL + 'restrictions', restrictionData, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async getRestrictions() {
    try {
      const response = await axios.get(API_URL + 'restrictions', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteRestriction(id) {
    try {
      const response = await axios.delete(API_URL + `restrictions/${id}`, { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Novo método para obter insights sobre a estratégia dietética
  async getDietInsights() {
    try {
      const response = await axios.get(API_URL + 'insights', { headers: authHeader() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Método para comparar diferentes estratégias
  async compareStrategies(currentWeight, targetWeight, timeframe) {
    try {
      const response = await axios.post(API_URL + 'compare-strategies', 
        { 
          current_weight: currentWeight,
          target_weight: targetWeight,
          timeframe_weeks: timeframe
        }, 
        { headers: authHeader() }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DietService();