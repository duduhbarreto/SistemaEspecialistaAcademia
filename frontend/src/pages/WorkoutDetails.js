import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Table, Modal, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaDumbbell, FaClock, FaChartLine, FaClipboardCheck } from 'react-icons/fa';
import { WorkoutContext } from '../context/WorkoutContext';

const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWorkout, recordWorkout, loading } = useContext(WorkoutContext);
  
  const [workout, setWorkout] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('Adequado');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      const response = await getWorkout(id);
      if (response.success) {
        setWorkout(response.workout);
      } else {
        toast.error('Falha ao carregar detalhes do treino');
        navigate('/workouts');
      }
    };
    
    fetchWorkoutDetails();
  }, [getWorkout, id, navigate]);
  
  const handleCompleteWorkout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const success = await recordWorkout(workout.id, feedback, notes);
      
      if (success) {
        setShowModal(false);
        toast.success('Treino registrado com sucesso!');
        navigate('/history');
      }
    } catch (error) {
      console.error('Error recording workout:', error);
      toast.error('Falha ao registrar treino');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading || !workout) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando detalhes do treino...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{workout.name}</h1>
        <div>
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/workouts"
            className="me-2"
          >
            Voltar para Treinos
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowModal(true)}
          >
            <FaClipboardCheck className="me-2" />
            Registrar Treino
          </Button>
        </div>
      </div>
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="mb-4">
                <h5>Descrição</h5>
                <p>{workout.description}</p>
              </div>
              
              <div className="d-flex flex-wrap mb-4">
                <div className="me-4 mb-3">
                  <h6 className="text-muted mb-1">Objetivo</h6>
                  <Badge bg="primary" className="fs-6">{workout.goal}</Badge>
                </div>
                <div className="me-4 mb-3">
                  <h6 className="text-muted mb-1">Nível</h6>
                  <Badge bg="secondary" className="fs-6">{workout.experience_level}</Badge>
                </div>
                <div className="mb-3">
                  <h6 className="text-muted mb-1">Duração Estimada</h6>
                  <div className="d-flex align-items-center">
                    <FaClock className="text-primary me-2" />
                    <span>{workout.estimated_duration} minutos</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="d-flex align-items-center mb-3">
                  <FaDumbbell className="text-primary me-2" />
                  Exercícios
                </h5>
                
                {workout.exercises && workout.exercises.length > 0 ? (
                  <Table responsive className="table-responsive-card">
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Exercício</th>
                        <th>Grupo Muscular</th>
                        <th>Séries</th>
                        <th>Repetições</th>
                        <th>Descanso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workout.exercises.map(exercise => (
                        <tr key={exercise.id}>
                          <td data-label="Exercício">{exercise.name}</td>
                          <td data-label="Grupo Muscular">{exercise.muscle_group?.name || 'N/A'}</td>
                          <td data-label="Séries">{exercise.workout_exercise.sets}</td>
                          <td data-label="Repetições">{exercise.workout_exercise.repetitions}</td>
                          <td data-label="Descanso">{exercise.workout_exercise.rest_time} segundos</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p>Nenhum exercício encontrado para este treino.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Instruções de Treino</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-light rounded-circle p-2 text-primary">
                        <FaChartLine />
                      </div>
                    </div>
                    <div>
                      <h6>Intensidade</h6>
                      <p className="text-muted small">Aumente gradualmente a carga à medida que se sente confortável.</p>
                    </div>
                  </div>
                </li>
                <li className="mb-3">
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-light rounded-circle p-2 text-primary">
                        <FaClock />
                      </div>
                    </div>
                    <div>
                      <h6>Descanso</h6>
                      <p className="text-muted small">Respeite os tempos de descanso entre as séries para maximizar os resultados.</p>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="d-flex">
                    <div className="me-3">
                      <div className="bg-light rounded-circle p-2 text-primary">
                        <FaDumbbell />
                      </div>
                    </div>
                    <div>
                      <h6>Técnica</h6>
                      <p className="text-muted small">Foque na execução correta dos movimentos, não no peso.</p>
                    </div>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Dicas</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Aquecimento:</strong> Faça 5-10 minutos de exercício cardiovascular leve antes de começar.</p>
              <p><strong>Hidratação:</strong> Beba água durante todo o treino.</p>
              <p><strong>Alimentação:</strong> Consuma proteínas e carboidratos após o treino para recuperação.</p>
              <div className="d-grid mt-4">
                <Button 
                  variant="success"
                  onClick={() => setShowModal(true)}
                >
                  Registrar Treino Concluído
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Complete Workout Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Treino Concluído</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCompleteWorkout}>
            <Form.Group className="mb-3">
              <Form.Label>Como foi o treino?</Form.Label>
              <Form.Select 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              >
                <option value="Muito fácil">Muito fácil</option>
                <option value="Adequado">Adequado</option>
                <option value="Difícil">Difícil</option>
                <option value="Muito difícil">Muito difícil</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Observações (opcional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Digite suas observações sobre o treino..."
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={() => setShowModal(false)}
                className="me-2"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Registrando...
                  </>
                ) : (
                  'Registrar'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default WorkoutDetails;