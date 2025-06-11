import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { WorkoutContext } from '../context/WorkoutContext';

const WorkoutList = () => {
  const { workouts, loading, fetchWorkouts } = useContext(WorkoutContext);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [filters, setFilters] = useState({
    goal: '',
    level: '',
    duration: ''
  });
  const [error, setError] = useState('');
  const [displayLoading, setDisplayLoading] = useState(true);
  
  // Definir um timeout para mostrar mensagem de erro após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && displayLoading) {
        setError('O carregamento está demorando mais do que o esperado. Verifique sua conexão com a internet ou tente novamente mais tarde.');
      }
    }, 10000); // Mostrar mensagem após 10 segundos de carregamento

    return () => clearTimeout(timer);
  }, [loading, displayLoading]);
  
  // Fetch workouts if needed
  useEffect(() => {
    console.log('WorkoutList mounted/updated, workouts:', workouts);
    const loadData = async () => {
      try {
        console.log('Trying to fetch workouts...');
        setDisplayLoading(true);
        await fetchWorkouts();
      } catch (e) {
        console.error('Error in WorkoutList useEffect:', e);
        setError('Erro ao carregar treinos. Por favor, tente novamente.');
      } finally {
        // Definir um tempo mínimo de exibição do loading para evitar flash
        setTimeout(() => {
          setDisplayLoading(false);
        }, 500);
      }
    };
    
    if (workouts.length === 0) {
      loadData();
    } else {
      setDisplayLoading(false);
    }
  }, [fetchWorkouts, workouts.length]);
  
  // Filter workouts when workouts or filters change
  useEffect(() => {
    console.log('Filtering workouts, workouts:', workouts);
    filterWorkouts();
  }, [workouts, filters]);
  
  const filterWorkouts = () => {
    // Garantir que workouts é um array
    if (!Array.isArray(workouts)) {
      console.error('workouts is not an array:', workouts);
      setFilteredWorkouts([]);
      return;
    }
    
    let filtered = [...workouts];
    
    if (filters.goal) {
      filtered = filtered.filter(workout => workout.goal === filters.goal);
    }
    
    if (filters.level) {
      filtered = filtered.filter(workout => workout.experience_level === filters.level);
    }
    
    if (filters.duration) {
      switch (filters.duration) {
        case 'short':
          filtered = filtered.filter(workout => workout.estimated_duration <= 30);
          break;
        case 'medium':
          filtered = filtered.filter(workout => workout.estimated_duration > 30 && workout.estimated_duration <= 60);
          break;
        case 'long':
          filtered = filtered.filter(workout => workout.estimated_duration > 60);
          break;
        default:
          break;
      }
    }
    
    console.log('Filtered workouts:', filtered);
    setFilteredWorkouts(filtered);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      goal: '',
      level: '',
      duration: ''
    });
  };

  const handleRetry = async () => {
    setError('');
    setDisplayLoading(true);
    try {
      await fetchWorkouts();
    } catch (e) {
      console.error('Error in retry:', e);
      setError('Erro ao carregar treinos. Por favor, tente novamente.');
    } finally {
      setDisplayLoading(false);
    }
  };

  // Mostrar mensagem de depuração
  console.log('Render state:', { 
    workoutsLength: workouts.length, 
    filteredLength: filteredWorkouts.length, 
    loading, 
    displayLoading,
    error 
  });

  return (
    <Container className="py-4">
      <h1 className="mb-4">Todos os Treinos</h1>
      
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          <Alert.Heading>Erro!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={handleRetry}>
            Tentar Novamente
          </Button>
        </Alert>
      )}
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3">Filtros</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Objetivo</Form.Label>
                <Form.Select 
                  name="goal"
                  value={filters.goal}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="Perda de peso">Perda de peso</option>
                  <option value="Hipertrofia">Hipertrofia</option>
                  <option value="Condicionamento">Condicionamento</option>
                  <option value="Definição">Definição</option>
                  <option value="Reabilitação">Reabilitação</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Nível</Form.Label>
                <Form.Select
                  name="level"
                  value={filters.level}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Duração</Form.Label>
                <Form.Select
                  name="duration"
                  value={filters.duration}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="short">Curta (≤ 30 min)</option>
                  <option value="medium">Média (31-60 min)</option>
                  <option value="long">Longa (&gt; 60 min)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                onClick={resetFilters}
                className="mb-3 w-100"
                disabled={displayLoading}
              >
                Limpar Filtros
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Workouts Grid */}
      {displayLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando treinos...</p>
        </div>
      ) : (
        <>
          {filteredWorkouts.length === 0 ? (
            <Card className="text-center p-5 shadow-sm">
              <Card.Body>
                <h4>Nenhum treino encontrado</h4>
                <p>Tente ajustar os filtros para encontrar treinos disponíveis ou verifique sua conexão.</p>
                <div className="mt-3">
                  <Button onClick={resetFilters} variant="primary" className="me-2">
                    Limpar Filtros
                  </Button>
                  <Button onClick={handleRetry} variant="outline-primary">
                    Atualizar Lista
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {filteredWorkouts.map((workout) => (
                <Col key={workout.id} lg={4} md={6} className="mb-4">
                  <Card className="h-100 shadow-sm workout-card">
                    <Card.Body>
                      <Card.Title>{workout.name}</Card.Title>
                      <div className="mb-2">
                        <Badge bg="primary" className="me-1">{workout.goal}</Badge>
                        <Badge bg="secondary" className="me-1">{workout.experience_level}</Badge>
                        <Badge bg="info">{workout.estimated_duration} min</Badge>
                      </div>
                      <Card.Text className="text-truncate">
                        {workout.description}
                      </Card.Text>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0">
                      <Button 
                        as={Link} 
                        to={`/workouts/${workout.id}`}
                        variant="outline-primary" 
                        className="w-100"
                      >
                        Ver Detalhes
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default WorkoutList;