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
  const [geneticWorkout, setGeneticWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geneticLoading, setGeneticLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // State for next recommended workout in sequence
  const [nextWorkout, setNextWorkout] = useState(null);
  const [nextWorkoutLoading, setNextWorkoutLoading] = useState(false);

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

  // NOVO: Função para buscar treino com algoritmo genético
  const fetchGeneticWorkout = useCallback(async () => {
    console.log("Fetching genetic workout...");
    try {
      setGeneticLoading(true);
      const response = await workoutService.getGeneticRecommendation();
      if (response && response.success) {
        setGeneticWorkout(response.workout);
        toast.success('Treino genético gerado com sucesso!');
        return response;
      } else {
        console.error("Failed to fetch genetic workout:", response);
        toast.error(response.message || 'Erro ao gerar treino genético');
        return response;
      }
    } catch (error) {
      console.error('Error fetching genetic workout:', error);
      toast.error('Erro ao comunicar com o servidor');
      return { success: false, message: 'Erro ao comunicar com o servidor' };
    } finally {
      setGeneticLoading(false);
    }
  }, []);

  // NOVO: Função para buscar o próximo treino na sequência
  const fetchNextWorkout = useCallback(async () => {
    console.log("Fetching next workout in sequence...");
    try {
      setNextWorkoutLoading(true);
      const response = await historyService.getNextWorkout();
      if (response && response.success) {
        setNextWorkout(response);
        return response;
      } else {
        console.error("Failed to fetch next workout in sequence:", response);
        return response;
      }
    } catch (error) {
      console.error('Error fetching next workout:', error);
      return { success: false, message: 'Erro ao buscar próximo treino' };
    } finally {
      setNextWorkoutLoading(false);
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
        // Inicialmente buscar o próximo treino da sequência
        await fetchNextWorkout();
      }
    };
    
    loadData();
  }, [currentUser, initialized, fetchWorkouts, fetchRecommendedWorkout, fetchWorkoutHistory, fetchNextWorkout]);

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
        
        // NOVO: Se houver um próximo treino retornado, atualizar o estado
        if (response.nextWorkout) {
          setNextWorkout(response.nextWorkout);
          console.log("Next workout in sequence updated:", response.nextWorkout);
        }
        
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
    geneticWorkout,
    workoutHistory,
    loading,
    geneticLoading,
    nextWorkout,
    nextWorkoutLoading,
    fetchWorkouts,
    fetchRecommendedWorkout,
    fetchGeneticWorkout,
    fetchWorkoutHistory,
    fetchNextWorkout,
    getWorkout,
    recordWorkout
  };

  console.log("WorkoutContext state:", {
    workoutsCount: workouts.length,
    hasRecommendedWorkout: !!recommendedWorkout,
    hasGeneticWorkout: !!geneticWorkout,
    hasNextWorkout: !!nextWorkout,
    historyCount: workoutHistory.length,
    loading,
    geneticLoading,
    nextWorkoutLoading,
    initialized
  });

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
    </WorkoutContext.Provider>
  );
};