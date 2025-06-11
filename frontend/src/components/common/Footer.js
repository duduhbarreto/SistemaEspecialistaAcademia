import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <Container>
        <Row className="justify-content-between">
          <Col md={4} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <FaDumbbell className="me-2" size={24} />
              <h5 className="mb-0">Sistema Especialista de Academia</h5>
            </div>
            <p className="mb-0">
              Sua plataforma para treinos personalizados e acompanhamento de progresso na academia.
            </p>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-decoration-none text-white-50 hover-white">
                  Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/workouts" className="text-decoration-none text-white-50 hover-white">
                  Treinos
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/exercises" className="text-decoration-none text-white-50 hover-white">
                  Exercícios
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-decoration-none text-white-50 hover-white">
                  Sobre
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={3} className="mb-4 mb-md-0">
            <h6 className="mb-3">Redes Sociais</h6>
            <div className="d-flex">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="me-3 text-white"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="me-3 text-white"
              >
                <FaInstagram size={24} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white"
              >
                <FaTwitter size={24} />
              </a>
            </div>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <div className="text-center">
          <p className="mb-0">
            &copy; {currentYear} Sistema Especialista de Academia. Todos os direitos reservados.
          </p>
          <p className="small text-muted mt-2">
            Desenvolvido como projeto para disciplina de Inteligência Artificial.
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;