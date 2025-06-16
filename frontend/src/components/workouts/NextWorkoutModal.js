import React from 'react';
import { Modal, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaArrowRight, FaDna, FaCalendarAlt } from 'react-icons/fa';

/**
 * Modal component to show the next recommended workout
 * Displayed after a user completes a workout
 */
const NextWorkoutModal = ({ show, onHide, nextWorkout }) => {
  if (!nextWorkout || !nextWorkout.workout) {
    return null;
  }

  // Check if this is a genetic workout
  const isGeneticWorkout = 
    (nextWorkout.workout.genetic === true) || 
    (nextWorkout.workout.name && (nextWorkout.workout.name.includes('Genético') || nextWorkout.workout.name.includes('Genetic'))) ||
    (nextWorkout.split_info !== undefined);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <FaCalendarAlt className="me-2" />
          Próximo Treino Recomendado
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="success" className="mb-4">
          <div className="d-flex align-items-center">
            <FaDumbbell className="me-2" />
            <div>
              <strong>Treino registrado com sucesso!</strong>
              <p className="mb-0 mt-1">
                Baseado no seu histórico, recomendamos o seguinte treino para sua próxima sessão:
              </p>
            </div>
          </div>
        </Alert>

        <div className="mb-4">
          <h4>{nextWorkout.workout.name}</h4>
          <p className="text-muted">{nextWorkout.workout.description}</p>
          
          <div className="mb-2">
            <Badge bg="primary" className="me-2">{nextWorkout.workout.goal}</Badge>
            <Badge bg="secondary" className="me-2">{nextWorkout.workout.experience_level}</Badge>
            <Badge bg="info" className="me-2">{nextWorkout.workout.estimated_duration} min</Badge>
            {isGeneticWorkout && (
              <Badge bg="success">
                <FaDna className="me-1" /> Genético
              </Badge>
            )}
          </div>
        </div>

        {/* Split info for genetic workouts */}
        {nextWorkout.split_info && (
          <Alert variant="info" className="mb-4">
            <div className="d-flex align-items-start">
              <FaDna className="me-2 mt-1" />
              <div>
                <h5 className="mb-1">{nextWorkout.split_info.name}</h5>
                <p className="mb-0">{nextWorkout.split_info.description}</p>
              </div>
            </div>
          </Alert>
        )}

        {/* Reason for recommendation */}
        {nextWorkout.recommendation_reason && (
          <div className="mb-4">
            <h5>Por que este treino?</h5>
            <p>{nextWorkout.recommendation_reason}</p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Ver Histórico
        </Button>
        <Button 
          variant="success" 
          as={Link} 
          to={`/workouts/${nextWorkout.workout.id}`}
          onClick={onHide}
        >
          <FaDumbbell className="me-1" /> 
          Iniciar Este Treino <FaArrowRight className="ms-1" />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NextWorkoutModal;