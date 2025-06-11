import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Form, Table, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { FaDumbbell, FaSearch } from 'react-icons/fa';
import exerciseService from '../api/exercise.service';

const Exercises = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Fácil');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all exercises
        const exercisesResponse = await exerciseService.getAll();
        if (exercisesResponse.success) {
          setExercises(exercisesResponse.exercises);
          setFilteredExercises(exercisesResponse.exercises);
        }
        
        // Fetch muscle groups
        const muscleGroupsResponse = await exerciseService.getMuscleGroups();
        if (muscleGroupsResponse.success) {
          setMuscleGroups(muscleGroupsResponse.muscleGroups);
          if (muscleGroupsResponse.muscleGroups.length > 0) {
            setSelectedMuscleGroup(muscleGroupsResponse.muscleGroups[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  useEffect(() => {
    // Filter exercises by search term
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(
        exercise => exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchTerm, exercises]);
  
  const handleMuscleGroupChange = async (e) => {
    const muscleGroupId = e.target.value;
    setSelectedMuscleGroup(muscleGroupId);
    
    if (muscleGroupId) {
      setLoading(true);
      try {
        const response = await exerciseService.getByMuscleGroup(muscleGroupId);
        if (response.success) {
          setFilteredExercises(response.exercises);
        }
      } catch (error) {
        console.error('Error fetching exercises by muscle group:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDifficultyChange = async (e) => {
    const difficulty = e.target.value;
    setSelectedDifficulty(difficulty);
    
    if (difficulty) {
      setLoading(true);
      try {
        const response = await exerciseService.getByDifficulty(difficulty);
        if (response.success) {
          setFilteredExercises(response.exercises);
        }
      } catch (error) {
        console.error('Error fetching exercises by difficulty:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleExerciseClick = async (exerciseId) => {
    setLoading(true);
    try {
      const response = await exerciseService.getOne(exerciseId);
      if (response.success) {
        setSelectedExercise(response.exercise);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching exercise details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderExerciseList = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando exercícios...</p>
        </div>
      );
    }
    
    if (filteredExercises.length === 0) {
      return (
        <div className="text-center py-4">
          <p>Nenhum exercício encontrado.</p>
        </div>
      );
    }
    
    return (
      <Table hover responsive className="table-responsive-card">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Grupo Muscular</th>
            <th>Dificuldade</th>
            <th>Equipamento</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredExercises.map(exercise => (
            <tr key={exercise.id}>
              <td data-label="Nome">{exercise.name}</td>
              <td data-label="Grupo Muscular">{exercise.muscle_group?.name || 'N/A'}</td>
              <td data-label="Dificuldade">
                <Badge 
                  bg={
                    exercise.difficulty_level === 'Difícil' ? 'danger' : 
                    exercise.difficulty_level === 'Médio' ? 'warning' : 
                    'success'
                  }
                >
                  {exercise.difficulty_level}
                </Badge>
              </td>
              <td data-label="Equipamento">
                {exercise.equipment_required ? 'Sim' : 'Não'}
              </td>
              <td data-label="Ações">
                <Button 
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleExerciseClick(exercise.id)}
                >
                  Ver Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Exercícios</h1>
      
      {/* Search Bar */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group>
            <div className="input-group">
              <Form.Control
                type="text"
                placeholder="Buscar exercícios por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="primary">
                <FaSearch />
              </Button>
            </div>
          </Form.Group>
        </Card.Body>
      </Card>
      
      {/* Tabs and Content */}
      <Card className="shadow-sm">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(key) => setActiveTab(key)}
            className="mb-4"
          >
            <Tab eventKey="all" title="Todos os Exercícios">
              {renderExerciseList()}
            </Tab>
            
            <Tab eventKey="byMuscle" title="Por Grupo Muscular">
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Selecione o grupo muscular:</Form.Label>
                    <Form.Select 
                      value={selectedMuscleGroup}
                      onChange={handleMuscleGroupChange}
                    >
                      {muscleGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {renderExerciseList()}
            </Tab>
            
            <Tab eventKey="byDifficulty" title="Por Dificuldade">
              <Row className="mb-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Selecione o nível de dificuldade:</Form.Label>
                    <Form.Select 
                      value={selectedDifficulty}
                      onChange={handleDifficultyChange}
                    >
                      <option value="Fácil">Fácil</option>
                      <option value="Médio">Médio</option>
                      <option value="Difícil">Difícil</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              {renderExerciseList()}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Exercise Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaDumbbell className="me-2" />
            {selectedExercise?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedExercise && (
            <>
              <div className="mb-3">
                <Badge 
                  bg="secondary" 
                  className="me-1"
                >
                  {selectedExercise.muscle_group?.name || 'Grupo muscular não definido'}
                </Badge>
                <Badge 
                  bg={
                    selectedExercise.difficulty_level === 'Difícil' ? 'danger' : 
                    selectedExercise.difficulty_level === 'Médio' ? 'warning' : 
                    'success'
                  }
                >
                  {selectedExercise.difficulty_level}
                </Badge>
                <Badge 
                  bg="info"
                  className="ms-1"
                >
                  {selectedExercise.equipment_required ? 'Necessita equipamento' : 'Sem equipamento'}
                </Badge>
              </div>
              
              <h5>Descrição</h5>
              <p>{selectedExercise.description}</p>
              
              {selectedExercise.workouts && selectedExercise.workouts.length > 0 && (
                <>
                  <h5 className="mt-4">Treinos que incluem este exercício</h5>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Treino</th>
                        <th>Séries</th>
                        <th>Repetições</th>
                        <th>Descanso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExercise.workouts.map(workout => (
                        <tr key={workout.id}>
                          <td>{workout.name}</td>
                          <td>{workout.workout_exercise.sets}</td>
                          <td>{workout.workout_exercise.repetitions}</td>
                          <td>{workout.workout_exercise.rest_time} segundos</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Exercises;