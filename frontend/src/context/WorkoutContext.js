import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import workoutService from '../api/workout.service';
import historyService from '../api/history.service';
import { AuthContext } from './AuthContext';

export const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [workouts, setWorkouts] = useState([]);
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Use useCallback para evitar recriações de funções
  const fetchWorkouts = useCallback(async () => {
    console.log("Fetching workouts...");
    try {
      setLoading(true);
      const response = await workoutService.getAll();
      console.log("Workout response:", response);
      if (response && response.success) {
        setWorkouts(response.workouts || []);
      } else {
        console.error("Failed to fetch workouts:", response);
        // Não mostrar toast aqui para evitar múltiplas notificações
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      // Não mostrar toast aqui para evitar múltiplas notificações
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendedWorkout = useCallback(async () => {
    console.log("Fetching recommended workout...");
    try {
      const response = await workoutService.getRecommended();
      if (response && response.success) {
        setRecommendedWorkout(response.workout);
      } else {
        console.error("Failed to fetch recommended workout:", response);
      }
    } catch (error) {
      console.error('Error fetching recommended workout:', error);
      // Não mostrar toast para não irritar o usuário
    }
  }, []);

  const fetchWorkoutHistory = useCallback(async () => {
    console.log("Fetching workout history...");
    try {
      const response = await historyService.getAll();
      if (response && response.success) {
        setWorkoutHistory(response.history || []);
      } else {
        console.error("Failed to fetch workout history:", response);
      }
    } catch (error) {
      console.error('Error fetching workout history:', error);
      // Não mostrar toast para não irritar o usuário
    }
  }, []);

  // Load data when user is authenticated - only once
  useEffect(() => {
    const loadData = async () => {
      if (currentUser && !initialized) {
        console.log("Initializing workout data...");
        setInitialized(true);
        await fetchWorkouts();
        await fetchRecommendedWorkout();
        await fetchWorkoutHistory();
      }
    };
    
    loadData();
  }, [currentUser, initialized, fetchWorkouts, fetchRecommendedWorkout, fetchWorkoutHistory]);

  const getWorkout = useCallback(async (id) => {
    console.log(`Getting workout with id: ${id}`);
    try {
      setLoading(true);
      const response = await workoutService.getOne(id);
      return response || { success: false };
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Erro ao carregar detalhes do treino');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const recordWorkout = async (workoutId, feedback, notes) => {
    try {
      setLoading(true);
      const historyData = {
        workout_id: workoutId,
        feedback: feedback,
        notes: notes
      };

      const response = await historyService.create(historyData);
      
      if (response && response.success) {
        // Refresh workout history
        await fetchWorkoutHistory();
        toast.success('Treino registrado com sucesso!');
        return true;
      } else {
        toast.error(response?.message || 'Falha ao registrar treino');
        return false;
      }
    } catch (error) {
      console.error('Error recording workout:', error);
      toast.error('Erro ao registrar treino');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Expor o contexto com logs para depuração
  const contextValue = {
    workouts,
    recommendedWorkout,
    workoutHistory,
    loading,
    fetchWorkouts,
    fetchRecommendedWorkout,
    fetchWorkoutHistory,
    getWorkout,
    recordWorkout
  };

  console.log("WorkoutContext state:", {
    workoutsCount: workouts.length,
    hasRecommendedWorkout: !!recommendedWorkout,
    historyCount: workoutHistory.length,
    loading,
    initialized
  });

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};