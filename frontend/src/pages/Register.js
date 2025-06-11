import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Nome é obrigatório'),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório'),
  password: Yup.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
  age: Yup.number()
    .min(0, 'Idade inválida')
    .max(120, 'Idade inválida')
    .required('Idade é obrigatória'),
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

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    const { confirmPassword, ...userData } = values;
    
    const success = await register(userData);
    if (success) {
      navigate('/login');
    }
    
    setSubmitting(false);
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h2>Cadastre-se</h2>
              <p className="mb-0">Crie sua conta para acessar o Sistema Especialista de Academia</p>
            </Card.Header>
            <Card.Body className="p-4">
              <Formik
                initialValues={{ 
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  age: '',
                  weight: '',
                  height: '',
                  goal: 'Perda de peso',
                  experience_level: 'Iniciante'
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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
                          <Form.Label>Nome completo</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            placeholder="Seu nome completo"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.name && errors.name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="Seu email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Senha</Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Sua senha"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.password && errors.password}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar senha</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirme sua senha"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirmPassword && errors.confirmPassword}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.confirmPassword}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Idade</Form.Label>
                          <Form.Control
                            type="number"
                            name="age"
                            placeholder="Sua idade"
                            value={values.age}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.age && errors.age}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.age}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Peso (kg)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            name="weight"
                            placeholder="Seu peso em kg"
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
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Altura (m)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            name="height"
                            placeholder="Sua altura em metros"
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

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
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
                          Cadastrando...
                        </>
                      ) : (
                        'Cadastrar'
                      )}
                    </Button>

                    <div className="text-center mt-3">
                      <p className="mb-0">
                        Já tem uma conta? <Link to="/login">Faça login</Link>
                      </p>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;