import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userService from '../api/user.service';
import { FaUserEdit, FaKey, FaWeight, FaEnvelope, FaTrashAlt, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

// Esquemas de validação
const profileValidationSchema = Yup.object().shape({
  weight: Yup.number()
    .min(0, 'Peso inválido')
    .required('Peso é obrigatório'),
  height: Yup.number()
    .min(0, 'Altura inválida')
    .required('Altura é obrigatória'),
  goal: Yup.string()
    .required('Objetivo é obrigatório'),
  experience_level: Yup.string()
    .required('Nível de experiência é obrigatório')
});

const personalInfoValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .required('Nome é obrigatório'),
  age: Yup.number()
    .min(0, 'Idade inválida')
    .max(120, 'Idade inválida')
    .required('Idade é obrigatória')
});

const emailValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .required('Senha atual é obrigatória')
});

const passwordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Senha atual é obrigatória'),
  newPassword: Yup.string()
    .min(6, 'A nova senha deve ter pelo menos 6 caracteres')
    .required('Nova senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'As senhas não conferem')
    .required('Confirmação de senha é obrigatória')
});

const Profile = () => {
  const { currentUser, updateUserProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('info');
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    lastMonth: 0,
    streak: 0
  });
  
  // Estados para modais
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [showEmailSuccessModal, setShowEmailSuccessModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false);
  
  // Para exibir data da criação da conta
  const [accountCreatedAt, setAccountCreatedAt] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    const fetchUserDetails = async () => {
      try {
        const response = await userService.getProfile();
        if (response.success) {
          // Extrair a data de criação da conta
          if (response.user && response.user.createdAt) {
            setAccountCreatedAt(new Date(response.user.createdAt));
          }
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchStats();
    fetchUserDetails();
  }, []);

  const handleSubmitProfile = async (values, { setSubmitting }) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateProfile(values);
      
      if (response.success) {
        updateUserProfile(values);
        setMessage({ 
          type: 'success', 
          text: 'Perfil atualizado com sucesso!' 
        });
      } else {
        setMessage({ 
          type: 'danger', 
          text: response.message || 'Falha ao atualizar perfil.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erro ao conectar ao servidor.' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSubmitPersonalInfo = async (values, { setSubmitting }) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updatePersonalInfo(values);
      
      if (response.success) {
        updateUserProfile(values);
        setMessage({ 
          type: 'success', 
          text: 'Informações pessoais atualizadas com sucesso!' 
        });
      } else {
        setMessage({ 
          type: 'danger', 
          text: response.message || 'Falha ao atualizar informações pessoais.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erro ao conectar ao servidor.' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSubmitEmail = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.updateEmail(values);
      
      if (response.success) {
        setNewEmail(values.email);
        setShowEmailSuccessModal(true);
        updateUserProfile({ email: values.email });
        resetForm();
      } else {
        setMessage({ 
          type: 'danger', 
          text: response.message || 'Falha ao atualizar email.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erro ao conectar ao servidor.' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSubmitPassword = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      if (response.success) {
        setShowPasswordSuccessModal(true);
        resetForm();
      } else {
        setMessage({ 
          type: 'danger', 
          text: response.message || 'Falha ao alterar senha.' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Erro ao conectar ao servidor.' 
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const response = await userService.deleteAccount({
        password: deletePassword
      });
      
      if (response.success) {
        // Desloga o usuário e redireciona para a página inicial
        logout();
        navigate('/');
      } else {
        setDeleteError(response.message || 'Falha ao excluir conta.');
      }
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Erro ao conectar ao servidor.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  if (!currentUser) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Carregando perfil...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Meu Perfil</h1>
      
      {message.text && (
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}
      
      <Row>
        {/* User Info Card */}
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 d-flex align-items-center">
                <FaUserEdit className="me-2" /> Informações do Usuário
              </h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-circle bg-primary text-white me-3">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h5 className="mb-0">{currentUser.name}</h5>
                  <p className="text-muted mb-0">{currentUser.email}</p>
                  {accountCreatedAt && (
                    <small className="text-muted">
                      Membro desde {accountCreatedAt.toLocaleDateString('pt-BR')}
                    </small>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Dados Pessoais</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Idade</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.age} anos</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Peso</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.weight} kg</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Altura</span>
                    <span className="badge bg-primary rounded-pill">{currentUser.height} m</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>IMC</span>
                    <span className="badge bg-primary rounded-pill">{getBMI()} ({getBMICategory()})</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Objetivo</span>
                    <span className="badge bg-info rounded-pill">{currentUser.goal}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Nível</span>
                    <span className="badge bg-secondary rounded-pill">{currentUser.experience_level}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h6>Estatísticas de Treino</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Total de Treinos</span>
                    <span className="badge bg-secondary rounded-pill">{stats.totalWorkouts}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Último Mês</span>
                    <span className="badge bg-secondary rounded-pill">{stats.lastMonth}</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Sequência Atual</span>
                    <span className="badge bg-success rounded-pill">{stats.streak} dia(s)</span>
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Settings Tabs */}
        <Col lg={8} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Configurações da Conta</h4>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => {
                  setActiveTab(k);
                  setMessage({ type: '', text: '' });
                }}
                className="mb-4"
              >
                {/* Aba de Informações Físicas */}
                <Tab eventKey="info" title="Informações Físicas">
                  <h5 className="mb-3">Atualizar Medidas e Objetivos</h5>
                  <Formik
                    initialValues={{
                      weight: currentUser.weight,
                      height: currentUser.height,
                      goal: currentUser.goal,
                      experience_level: currentUser.experience_level
                    }}
                    validationSchema={profileValidationSchema}
                    onSubmit={handleSubmitProfile}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Peso (kg)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                name="weight"
                                value={values.weight}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.weight && errors.weight}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.weight}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Altura (m)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                name="height"
                                value={values.height}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.height && errors.height}
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.height}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Objetivo</Form.Label>
                              <Form.Select
                                name="goal"
                                value={values.goal}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.goal && errors.goal}
                              >
                                <option value="Perda de peso">Perda de peso</option>
                                <option value="Hipertrofia">Hipertrofia</option>
                                <option value="Condicionamento">Condicionamento</option>
                                <option value="Definição">Definição</option>
                                <option value="Reabilitação">Reabilitação</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {errors.goal}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Nível de experiência</Form.Label>
                              <Form.Select
                                name="experience_level"
                                value={values.experience_level}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.experience_level && errors.experience_level}
                              >
                                <option value="Iniciante">Iniciante</option>
                                <option value="Intermediário">Intermediário</option>
                                <option value="Avançado">Avançado</option>
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">
                                {errors.experience_level}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <div className="d-grid">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Atualizando...
                              </>
                            ) : (
                              'Salvar Alterações'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
                
                {/* Aba de Informações Pessoais */}
                <Tab eventKey="personal" title="Informações Pessoais">
                  <h5 className="mb-3">Atualizar Nome e Idade</h5>
                  <Formik
                    initialValues={{
                      name: currentUser.name,
                      age: currentUser.age
                    }}
                    validationSchema={personalInfoValidationSchema}
                    onSubmit={handleSubmitPersonalInfo}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome Completo</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.name && errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Idade</Form.Label>
                          <Form.Control
                            type="number"
                            name="age"
                            value={values.age}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.age && errors.age}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.age}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Atualizando...
                              </>
                            ) : (
                              'Salvar Alterações'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
                
                {/* Aba de Email */}
                <Tab eventKey="email" title="Email">
                  <h5 className="mb-3">Alterar Email</h5>
                  <Formik
                    initialValues={{
                      email: '',
                      password: ''
                    }}
                    validationSchema={emailValidationSchema}
                    onSubmit={handleSubmitEmail}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Atual</Form.Label>
                          <Form.Control
                            type="text"
                            value={currentUser.email}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Novo Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Seu novo email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Senha Atual (para confirmação)</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Digite sua senha atual"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.password && errors.password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Atualizando...
                              </>
                            ) : (
                              'Alterar Email'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
                
                {/* Aba de Senha */}
                <Tab eventKey="password" title="Senha">
                  <h5 className="mb-3">Alterar Senha</h5>
                  <Formik
                    initialValues={{
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    }}
                    validationSchema={passwordValidationSchema}
                    onSubmit={handleSubmitPassword}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      isSubmitting
                    }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Senha Atual</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            placeholder="Digite sua senha atual"
                            value={values.currentPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.currentPassword && errors.currentPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.currentPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Nova Senha</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            placeholder="Digite a nova senha"
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.newPassword && errors.newPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.newPassword}
                          </Form.Control.Feedback>
                          <Form.Text className="text-muted">
                            A senha deve ter pelo menos 6 caracteres.
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Nova Senha</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirme a nova senha"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && errors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting || loading}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Alterando Senha...
                              </>
                            ) : (
                              'Alterar Senha'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </Tab>
                
                {/* Aba de Exclusão de Conta */}
                <Tab eventKey="delete" title="Excluir Conta">
                  <div className="p-4 border border-danger rounded mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <FaExclamationTriangle className="text-danger me-2" size={24} />
                      <h5 className="mb-0 text-danger">Zona de Perigo</h5>
                    </div>
                    <p className="mb-3">
                      A exclusão de sua conta é <strong>permanente</strong> e <strong>irreversível</strong>. 
                      Todos os seus dados serão excluídos, incluindo histórico de treinos e perfil.
                    </p>
                    <Button 
                      variant="danger" 
                      className="mt-2"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrashAlt className="me-2" /> Excluir Minha Conta
                    </Button>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal de Confirmação para Excluir Conta */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Esta ação <strong>excluirá permanentemente</strong> a sua conta e todos os dados associados a ela.</p>
          <p>Para confirmar, por favor digite sua senha:</p>
          
          {deleteError && (
            <Alert variant="danger">{deleteError}</Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Control
              type="password"
              placeholder="Digite sua senha"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={!deletePassword || deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Excluindo...
              </>
            ) : (
              'Excluir Permanentemente'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de Sucesso para Alteração de Email */}
      <Modal show={showEmailSuccessModal} onHide={() => setShowEmailSuccessModal(false)}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Email Atualizado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <FaEnvelope size={50} className="text-success" />
          </div>
          <p>Seu email foi atualizado com sucesso para <strong>{newEmail}</strong>.</p>
          <p>Use este novo email para fazer login na próxima vez.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowEmailSuccessModal(false)}>
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal de Sucesso para Alteração de Senha */}
      <Modal show={showPasswordSuccessModal} onHide={() => setShowPasswordSuccessModal(false)}>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Senha Alterada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <FaKey size={50} className="text-success" />
          </div>
          <p>Sua senha foi alterada com sucesso!</p>
          <p>Use a nova senha da próxima vez que fizer login.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => setShowPasswordSuccessModal(false)}>
            Entendi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;