import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { WorkoutContext } from '../context/WorkoutContext';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

moment.locale('pt-br');

const HistoryPage = () => {
  const { workoutHistory, loading, fetchWorkoutHistory } = useContext(WorkoutContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  
  useEffect(() => {
    fetchWorkoutHistory();
  }, [fetchWorkoutHistory]);
  
  useEffect(() => {
    // Prepare data for chart
    if (workoutHistory.length > 0) {
      // Group workouts by month for last 6 months
      const last6Months = [...Array(6)].map((_, i) => {
        return moment().subtract(i, 'months').format('MMM YYYY');
      }).reverse();
      
      const workoutsByMonth = last6Months.map(month => {
        return workoutHistory.filter(h => 
          moment(h.workout_date).format('MMM YYYY') === month
        ).length;
      });
      
      setChartData({
        labels: last6Months,
        datasets: [
          {
            label: 'Treinos por Mês',
            data: workoutsByMonth,
            backgroundColor: 'rgba(52, 152, 219, 0.6)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          }
        ]
      });
    }
  }, [workoutHistory]);
  
  const handleViewDetails = (history) => {
    setSelectedHistory(history);
    setShowModal(true);
  };
  
  const getFeedbackColor = (feedback) => {
    switch (feedback) {
      case 'Muito fácil':
        return 'success';
      case 'Adequado':
        return 'info';
      case 'Difícil':
        return 'warning';
      case 'Muito difícil':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Histórico de Treinos</h1>
      
      {/* Stats */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Evolução dos Treinos</h4>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : workoutHistory.length >= 3 ? (
                <Bar 
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: false,
                        text: 'Treinos por Mês'
                      }
                    }
                  }}
                  height={300}
                />
              ) : (
                <div className="text-center py-5">
                  <p>Complete pelo menos 3 treinos para ver a evolução.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0">Estatísticas</h4>
            </Card.Header>
            <Card.Body className="d-flex flex-column justify-content-around">
              <div className="stat-item text-center mb-4">
                <FaDumbbell size={36} className="text-primary mb-2" />
                <h2>{workoutHistory.length}</h2>
                <p className="text-muted mb-0">Total de Treinos</p>
              </div>
              <div className="stat-item text-center mb-4">
                <FaCalendarAlt size={36} className="text-success mb-2" />
                <h2>
                  {workoutHistory.filter(h => 
                    moment(h.workout_date).isAfter(moment().subtract(30, 'days'))
                  ).length}
                </h2>
                <p className="text-muted mb-0">Últimos 30 dias</p>
              </div>
              <div className="stat-item text-center">
                <FaChartLine size={36} className="text-warning mb-2" />
                <h2>
                  {workoutHistory.filter(h => 
                    moment(h.workout_date).isAfter(moment().subtract(7, 'days'))
                  ).length}
                </h2>
                <p className="text-muted mb-0">Esta Semana</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* History Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Treinos Realizados</h4>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Carregando histórico...</p>
            </div>
          ) : workoutHistory.length === 0 ? (
            <div className="text-center py-5">
              <h5 className="mb-3">Nenhum treino registrado</h5>
              <p className="mb-4">Comece a registrar seus treinos para acompanhar seu progresso.</p>
              <Button as={Link} to="/workouts" variant="primary">
                <FaDumbbell className="me-2" /> Ver Treinos Disponíveis
              </Button>
            </div>
          ) : (
            <Table responsive hover className="table-responsive-card">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Treino</th>
                  <th>Objetivo</th>
                  <th>Feedback</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {workoutHistory.sort((a, b) => 
                  new Date(b.workout_date) - new Date(a.workout_date)
                ).map((history) => (
                  <tr key={history.id}>
                    <td data-label="Data">
                      {moment(history.workout_date).format('DD/MM/YYYY')}
                      <div className="small text-muted">
                        {moment(history.workout_date).format('HH:mm')}
                      </div>
                    </td>
                    <td data-label="Treino">{history.workout.name}</td>
                    <td data-label="Objetivo">
                      <Badge bg="primary">{history.workout.goal}</Badge>
                    </td>
                    <td data-label="Feedback">
                      <Badge bg={getFeedbackColor(history.feedback)}>
                        {history.feedback}
                      </Badge>
                    </td>
                    <td data-label="Ações">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleViewDetails(history)}
                      >
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* History Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Treino</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedHistory && (
            <>
              <h4>{selectedHistory.workout.name}</h4>
              <p className="text-muted">
                <strong>Data:</strong> {moment(selectedHistory.workout_date).format('DD/MM/YYYY [às] HH:mm')}
              </p>
              
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Objetivo:</strong> <Badge bg="primary">{selectedHistory.workout.goal}</Badge>
                </Col>
                <Col md={4}>
                  <strong>Nível:</strong> <Badge bg="secondary">{selectedHistory.workout.experience_level}</Badge>
                </Col>
                <Col md={4}>
                  <strong>Duração:</strong> <Badge bg="info">{selectedHistory.workout.estimated_duration} min</Badge>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Feedback:</strong> <Badge bg={getFeedbackColor(selectedHistory.feedback)}>{selectedHistory.feedback}</Badge>
              </div>
              
              {selectedHistory.notes && (
                <div className="mb-4">
                  <strong>Observações:</strong>
                  <p className="border-start border-3 border-primary ps-3 mt-2">
                    {selectedHistory.notes}
                  </p>
                </div>
              )}
              
              <h5 className="mb-3">Exercícios</h5>
              {selectedHistory.workout.exercises && selectedHistory.workout.exercises.length > 0 ? (
                <Table striped bordered hover size="sm">
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
                    {selectedHistory.workout.exercises.map(exercise => (
                      <tr key={exercise.id}>
                        <td>{exercise.name}</td>
                        <td>{exercise.muscle_group?.name || 'N/A'}</td>
                        <td>{exercise.workout_exercise.sets}</td>
                        <td>{exercise.workout_exercise.repetitions}</td>
                        <td>{exercise.workout_exercise.rest_time}s</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>Nenhum exercício encontrado para este treino.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          {selectedHistory && (
            <Button 
              variant="primary" 
              as={Link} 
              to={`/workouts/${selectedHistory.workout.id}`}
              onClick={() => setShowModal(false)}
            >
              Ver Treino Completo
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default HistoryPage;