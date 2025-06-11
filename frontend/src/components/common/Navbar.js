import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { FaDumbbell, FaUserCircle } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const AppNavbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaDumbbell className="me-2" />
          <span>Sistema Especialista de Academia</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            
            {currentUser ? (
              <>
                <Nav.Link as={NavLink} to="/dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/workouts">
                  Treinos
                </Nav.Link>
                <Nav.Link as={NavLink} to="/exercises">
                  Exercícios
                </Nav.Link>
                <Nav.Link as={NavLink} to="/history">
                  Histórico
                </Nav.Link>
                <Nav.Link as={NavLink} to="/diet">
                  Dieta
                </Nav.Link>
                <NavDropdown 
                  title={
                    <span className="d-flex align-items-center">
                      <FaUserCircle className="me-1" />
                      {currentUser.name.split(' ')[0]}
                    </span>
                  } 
                  id="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Meu Perfil
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Sair
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  Login
                </Nav.Link>
                <Nav.Item>
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="light"
                    className="ms-2"
                  >
                    Cadastrar
                  </Button>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;