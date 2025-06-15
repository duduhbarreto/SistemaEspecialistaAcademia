import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaChartLine, FaClipboardList, FaUserAlt, FaRocket, FaRegThumbsUp, FaArrowRight,FaUtensils, FaListAlt, FaHistory, FaUser, FaMagic, FaCog, FaDna} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { WorkoutContext } from '../context/WorkoutContext';
import workoutService from '../api/workout.service';
import historyService from '../api/history.service';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { 
    recommendedWorkout, 
    geneticWorkout, 
    geneticLoading, 
    fetchGeneticWorkout 
  } = useContext(WorkoutContext);
  
  const [loading, setLoading] = useState(true);
  const [recentHistory, setRecentHistory] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    thisMonth: 0,
    streak: 0
  });
  
  // Estados para modal do algoritmo genético
  const [showGeneticModal, setShowGeneticModal] = useState(false);
  const [geneticWorkoutData, setGeneticWorkoutData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch recent history
        const historyResponse = await historyService.getRecent();
        if (historyResponse.success) {
          setRecentHistory(historyResponse.history);
        }
        
        // Fetch stats
        const statsResponse = await historyService.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const getBMI = () => {
    if (!currentUser.weight || !currentUser.height) return 'N/A';
    
    const bmi = currentUser.weight / (currentUser.height * currentUser.height);
    return bmi.toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = getBMI();
    if (bmi === 'N/A') return 'N/A';
    
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    if (bmi < 35) return 'Obesidade Grau I';
    if (bmi < 40) return 'Obesidade Grau II';
    return 'Obesidade Grau III';
  };

  // NOVO: Função para gerar treino genético
  const handleGenerateGeneticWorkout = async () => {
    const response = await fetchGeneticWorkout();
    if (response && response.success) {
      setGeneticWorkoutData(response);
      setShowGeneticModal(true);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* User Info */}
          <Row className="mb-4">
            <Col>
              <Card className="shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="flex-shrink-0">
                      <div className="avatar-circle bg-primary text-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h2 className="mb-1">Olá, {currentUser.name.split(' ')[0]}!</h2>
                      <p className="mb-0 text-muted">
                        Objetivo: <Badge bg="primary">{currentUser.goal}</Badge>
                        <span className="ms-2">Nível: <Badge bg="secondary">{currentUser.experience_level}</Badge></span>
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Stats */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body className="text-center">
                  <h5 className="text-muted">IMC</h5>
                  <h3 className="mb-0">{getBMI()}</h3>
                  <p className="small text-muted mb-0">{getBMICategory()}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body className="text-center">
                  <h5 className="text-muted">Total de Treinos</h5>
                  <h3 className="mb-0">{stats.totalWorkouts}</h3>
                  <p className="small text-muted mb-0">Desde o início</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body className="text-center">
                  <h5 className="text-muted">Este Mês</h5>
                  <h3 className="mb-0">{stats.thisMonth}</h3>
                  <p className="small text-muted mb-0">Treinos realizados</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm h-100">
                <Card.Body className="text-center">
                  <h5 className="text-muted">Sequência</h5>
                  <h3 className="mb-0">{stats.streak}</h3>
                  <p className="small text-muted mb-0">Dias consecutivos</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            {/* Recommended Workout */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-primary text-white">
                  <h4 className="mb-0">Treino Recomendado</h4>
                </Card.Header>
                <Card.Body>
                  {recommendedWorkout ? (
                    <>
                      <h5>{recommendedWorkout.name}</h5>
                      <p className="text-muted">
                        <Badge bg="info" className="me-2">{recommendedWorkout.goal}</Badge>
                        <Badge bg="secondary" className="me-2">{recommendedWorkout.experience_level}</Badge>
                        <Badge bg="light" text="dark">{recommendedWorkout.estimated_duration} min</Badge>
                      </p>
                      <p>{recommendedWorkout.description}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <Button as={Link} to={`/workouts/${recommendedWorkout.id}`} variant="primary">
                          Ver Detalhes
                        </Button>
                        <Link to="/workouts" className="text-decoration-none">Ver todos os treinos</Link>
                      </div>
                      
                      {/* NOVO: Botão para Algoritmo Genético */}
                      <div className="mt-3 pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted">Quer algo mais personalizado?</small>
                          </div>
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={handleGenerateGeneticWorkout}
                            disabled={geneticLoading}
                          >
                            {geneticLoading ? (
                              <>
                                <Spinner size="sm" className="me-1" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <FaDna className="me-1" />
                                IA Genética
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <p className="mb-3">Nenhum treino recomendado encontrado para o seu perfil.</p>
                      <div className="d-flex flex-column gap-2">
                        <Button as={Link} to="/workouts" variant="primary">
                          Explorar Treinos
                        </Button>
                        <Button 
                          variant="success" 
                          onClick={handleGenerateGeneticWorkout}
                          disabled={geneticLoading}
                        >
                          {geneticLoading ? (
                            <>
                              <Spinner size="sm" className="me-1" />
                              Gerando Treino com IA...
                            </>
                          ) : (
                            <>
                              <FaDna className="me-1" />
                              Gerar Treino com IA Genética
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col lg={6} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-secondary text-white">
                  <h4 className="mb-0">Atividade Recente</h4>
                </Card.Header>
                <Card.Body>
                  {recentHistory.length > 0 ? (
                    <div className="recent-history">
                      {recentHistory.map((item) => (
                        <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                          <div className="flex-shrink-0">
                            <div className="activity-icon bg-light text-primary">
                              <FaDumbbell />
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h6 className="mb-0">{item.workout.name}</h6>
                            <p className="text-muted small mb-0">
                              {new Date(item.workout_date).toLocaleDateString('pt-BR')} - 
                              Feedback: {item.feedback}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-2">
                        <Link to="/history" className="text-decoration-none">Ver histórico completo</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="mb-3">Você ainda não registrou nenhum treino.</p>
                      <Button as={Link} to="/workouts" variant="primary">
                        Começar Agora
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Quick Links */}
          <Row>
            <Col md={3} className="mb-4">
              <Card as={Link} to="/workouts" className="shadow-sm h-100 text-decoration-none text-dark border-0 quick-link-card">
                <Card.Body className="text-center">
                  <div className="icon-circle bg-primary text-white mb-3">
                    <FaDumbbell size={24} />
                  </div>
                  <h5>Todos os Treinos</h5>
                  <p className="text-muted mb-0">Explore todos os treinos disponíveis</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card as={Link} to="/exercises" className="shadow-sm h-100 text-decoration-none text-dark border-0 quick-link-card">
                <Card.Body className="text-center">
                  <div className="icon-circle bg-success text-white mb-3">
                    <FaListAlt size={24} />
                  </div>
                  <h5>Exercícios</h5>
                  <p className="text-muted mb-0">Consulte todos os exercícios</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card as={Link} to="/history" className="shadow-sm h-100 text-decoration-none text-dark border-0 quick-link-card">
                <Card.Body className="text-center">
                  <div className="icon-circle bg-info text-white mb-3">
                    <FaHistory size={24} />
                  </div>
                  <h5>Histórico</h5>
                  <p className="text-muted mb-0">Visualize seu histórico de treinos</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card as={Link} to="/profile" className="shadow-sm h-100 text-decoration-none text-dark border-0 quick-link-card">
                <Card.Body className="text-center">
                  <div className="icon-circle bg-warning text-white mb-3">
                    <FaUser size={24} />
                  </div>
                  <h5>Perfil</h5>
                  <p className="text-muted mb-0">Atualize suas informações</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-4">
              <Card as={Link} to="/diet" className="shadow-sm h-100 text-decoration-none text-dark border-0 quick-link-card">
                <Card.Body className="text-center">
                  <div className="icon-circle bg-success text-white mb-3">
                    <FaUtensils size={24} />
                  </div>
                  <h5>Plano Alimentar</h5>
                  <p className="text-muted mb-0">Calcule e visualize sua dieta</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* NOVO: Modal para Treino Genético */}
      <Modal show={showGeneticModal} onHide={() => setShowGeneticModal(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaDna className="me-2" />
            Treino Gerado por IA Genética
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {geneticWorkoutData && geneticWorkoutData.workout ? (
            <>
              <Alert variant="success" className="mb-4">
                <div className="d-flex align-items-center">
                  <FaMagic className="me-2" />
                  <div>
                    <strong>Treino Personalizado Criado!</strong>
                    <p className="mb-0 mt-1">
                      Este treino foi gerado especificamente para você usando algoritmo genético avançado 
                      que considera seu histórico, objetivos e nível de experiência.
                    </p>
                  </div>
                </div>
              </Alert>

              <div className="mb-4">
                <h4>{geneticWorkoutData.workout.name}</h4>
                <p className="text-muted">{geneticWorkoutData.workout.description}</p>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Badge bg="primary">{geneticWorkoutData.workout.goal}</Badge>
                  <Badge bg="secondary">{geneticWorkoutData.workout.experience_level}</Badge>
                  <Badge bg="info">{geneticWorkoutData.workout.estimated_duration} min</Badge>
                  {geneticWorkoutData.split_info && (
                    <Badge bg="warning">{geneticWorkoutData.split_info.name}</Badge>
                  )}
                </div>

                {geneticWorkoutData.split_info && (
                  <Alert variant="info" className="mb-3">
                    <small><strong>Divisão de Treino:</strong> {geneticWorkoutData.split_info.description}</small>
                  </Alert>
                )}
              </div>

              {geneticWorkoutData.workout.exercises && geneticWorkoutData.workout.exercises.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3">Exercícios do Treino</h5>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Exercício</th>
                          <th>Grupo Muscular</th>
                          <th>Séries</th>
                          <th>Repetições</th>
                          <th>Descanso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {geneticWorkoutData.workout.exercises.map((exercise, index) => (
                          <tr key={index}>
                            <td>{exercise.name}</td>
                            <td>
                              <Badge bg="light" text="dark">
                                {exercise.muscle_group?.name || 'N/A'}
                              </Badge>
                            </td>
                            <td>{exercise.workout_exercise.sets}</td>
                            <td>{exercise.workout_exercise.repetitions}</td>
                            <td>{exercise.workout_exercise.rest_time}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <Alert variant="warning">
                <div className="d-flex align-items-start">
                  <FaCog className="me-2 mt-1" />
                  <div>
                    <strong>Como funciona o Algoritmo Genético:</strong>
                    <p className="mb-0 mt-1">
                      Nossa IA analisa milhares de combinações de exercícios, considerando seu histórico de treinos, 
                      grupos musculares que precisam de mais atenção, e sua evolução pessoal para criar o treino 
                      mais eficiente para seus objetivos atuais.
                    </p>
                  </div>
                </div>
              </Alert>
            </>
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Processando dados do treino...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGeneticModal(false)}>
            Fechar
          </Button>
          {geneticWorkoutData && geneticWorkoutData.workout && (
            <Button 
              variant="success" 
              as={Link} 
              to={`/workouts/${geneticWorkoutData.workout.id}`}
              onClick={() => setShowGeneticModal(false)}
            >
              Iniciar Este Treino
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard;