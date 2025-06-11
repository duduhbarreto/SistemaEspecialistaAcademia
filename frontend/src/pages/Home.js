import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaDumbbell, 
  FaChartLine, 
  FaClipboardList, 
  FaUserAlt, 
  FaRocket, 
  FaRegThumbsUp, 
  FaArrowRight 
} from 'react-icons/fa';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const cardHover = {
  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
  hover: { 
    scale: 1.03, 
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.3
    }
  }
};

const buttonHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.3
    }
  }
};

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-image-container">
          <img 
            src="/gym-hero.jpg" 
            alt="Academia moderna com pessoas treinando" 
            className="hero-background-image"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <Container className="py-5 position-relative">
          <Row className="justify-content-center py-5">
            <Col lg={8} className="text-center text-white">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.7 }}
              >
                <h1 className="display-3 fw-bold mb-4">Sistema Especialista de Academia</h1>
                <p className="lead fs-4 mb-5">
                  Transforme seus treinos com nossa plataforma inteligente que personaliza 
                  os exercícios para seus objetivos e nível de experiência.
                </p>
                {/* Botão de CTA com maior contraste */}
                <motion.div 
                  className="d-flex justify-content-center gap-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={buttonHover} whileHover="hover" initial="rest">
                    <Button 
                      as={Link} 
                      to="/register" 
                      variant="warning" 
                      size="lg" 
                      className="rounded-pill px-4 fw-bold"
                    >
                      <span className="d-flex align-items-center">
                        Começar Agora <FaArrowRight className="ms-2" />
                      </span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
        
        {/* Wave divider */}
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path 
              fill="#ffffff" 
              fillOpacity="1" 
              d="M0,64L80,80C160,96,320,128,480,128C640,128,800,96,960,80C1120,64,1280,64,1360,64L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 features-section">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h6 className="text-primary text-uppercase fw-bold">Vantagens</h6>
            <h2 className="display-5 fw-bold mb-4">Como Funciona</h2>
            <p className="lead text-muted">Nossa plataforma inteligente facilita sua jornada fitness</p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <Row>
              {[
                {
                  icon: <FaUserAlt size={24} />,
                  title: "Perfil Personalizado",
                  description: "Crie seu perfil com objetivo, nível de experiência, peso, altura e histórico para treinos precisos.",
                  color: "primary"
                },
                {
                  icon: <FaDumbbell size={24} />,
                  title: "Recomendação Inteligente",
                  description: "Receba treinos personalizados baseados no seu perfil e objetivos específicos.",
                  color: "success"
                },
                {
                  icon: <FaClipboardList size={24} />,
                  title: "Registro de Treinos",
                  description: "Mantenha um histórico de treinos realizados e acompanhe seu progresso ao longo do tempo.",
                  color: "info"
                },
                {
                  icon: <FaChartLine size={24} />,
                  title: "Análise de Desempenho",
                  description: "Visualize estatísticas e métricas para entender seu progresso e melhorar seus resultados.",
                  color: "warning"
                }
              ].map((feature, index) => (
                <Col md={3} className="mb-4" key={index}>
                  <motion.div
                    variants={fadeIn}
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                    custom={index}
                  >
                    <motion.div
                      variants={cardHover}
                      className="feature-card h-100 rounded-4 p-4 text-center border-0 shadow-sm"
                    >
                      <motion.div 
                        className={`icon-circle bg-${feature.color} text-white mb-3 mx-auto`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <h4 className="mb-3">{feature.title}</h4>
                      <p className="text-muted mb-0">{feature.description}</p>
                    </motion.div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-5 benefits-section bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={5} className="mb-5 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="position-relative">
                  <div className="image-frame rounded-4 shadow overflow-hidden">
                    <img 
                      src="/600x400.jpg" 
                      alt="Pessoas treinando na academia" 
                      className="img-fluid" 
                    />
                  </div>
                  <motion.div 
                    className="stats-card bg-white p-3 rounded-4 shadow position-absolute"
                    style={{ bottom: '-30px', right: '-30px' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="stats-icon bg-primary rounded-circle p-2 text-white me-3">
                        <FaRocket />
                      </div>
                      <div>
                        <h5 className="mb-0">+ 500</h5>
                        <p className="mb-0 small text-muted">Treinos disponíveis</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Col>
            <Col lg={7}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h6 className="text-primary text-uppercase fw-bold">Benefícios</h6>
                <h2 className="display-5 fw-bold mb-4">Por que usar o Sistema Especialista de Academia?</h2>
                <p className="lead mb-4">Transforme sua experiência fitness com nossa plataforma inteligente:</p>
                
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    {
                      title: "Economia de tempo",
                      description: "Não perca tempo procurando treinos na internet, receba recomendações personalizadas."
                    },
                    {
                      title: "Resultados melhores",
                      description: "Treinos adaptados ao seu perfil geram resultados mais eficientes."
                    },
                    {
                      title: "Acompanhamento completo",
                      description: "Visualize seu progresso e adapte seus treinos conforme evolui."
                    },
                    {
                      title: "Base científica",
                      description: "Treinos elaborados com base em princípios de treinamento e fisiologia do exercício."
                    }
                  ].map((benefit, index) => (
                    <motion.div 
                      className="benefit-item d-flex align-items-start mb-4"
                      key={index}
                      variants={fadeIn}
                      custom={index}
                    >
                      <div className="benefit-icon me-3 p-2 rounded bg-primary text-white d-flex align-items-center justify-content-center">
                        <FaRegThumbsUp />
                      </div>
                      <div>
                        <h5>{benefit.title}</h5>
                        <p className="text-muted mb-0">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                <motion.div
                  className="mt-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button as={Link} to="/register" variant="primary" size="lg" className="rounded-pill px-4">
                    <span className="d-flex align-items-center">
                      Experimente Agora <FaArrowRight className="ms-2" />
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h6 className="text-primary text-uppercase fw-bold">Depoimentos</h6>
            <h2 className="display-5 fw-bold mb-4">O que nossos usuários dizem</h2>
            <p className="lead text-muted mb-5">Histórias reais de pessoas que transformaram sua rotina de exercícios</p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Row>
              {[
                {
                  name: "Marcos Silva",
                  time: "Usuário há 6 meses",
                  testimonial: "Nunca consegui manter uma rotina de exercícios consistente até começar a usar este sistema. Os treinos são desafiadores, mas adequados ao meu nível.",
                  initial: "M",
                  color: "primary"
                },
                {
                  name: "Carla Oliveira",
                  time: "Usuário há 3 meses",
                  testimonial: "Perdi 8kg desde que comecei a seguir os treinos recomendados! Adoro como o sistema se adapta conforme meu progresso e feedback.",
                  initial: "C",
                  color: "info"
                },
                {
                  name: "Rafael Costa",
                  time: "Usuário há 8 meses",
                  testimonial: "Como instrutor, recomendo a todos os meus alunos. Os treinos são bem estruturados e baseados em princípios científicos sólidos.",
                  initial: "R",
                  color: "success"
                }
              ].map((testimonial, index) => (
                <Col md={4} className="mb-4" key={index}>
                  <motion.div
                    variants={fadeIn}
                    custom={index}
                  >
                    <motion.div
                      className="testimonial-card h-100 bg-white p-4 rounded-4 shadow-sm"
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="d-flex align-items-center mb-4">
                        <motion.div 
                          className={`avatar-circle bg-${testimonial.color} text-white me-3`}
                          style={{width: '60px', height: '60px', fontSize: '24px'}}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {testimonial.initial}
                        </motion.div>
                        <div>
                          <h5 className="mb-0">{testimonial.name}</h5>
                          <p className="text-muted mb-0">{testimonial.time}</p>
                        </div>
                      </div>
                      <div className="testimonial-content">
                        <div className="quote-icon text-primary mb-2">
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 7H7V11H11V7Z" fill="currentColor" />
                            <path d="M7 13C7 13 7 17 11 17C11 17 11 13 7 13Z" fill="currentColor" />
                            <path d="M17 7H13V11H17V7Z" fill="currentColor" />
                            <path d="M13 13C13 13 13 17 17 17C17 17 17 13 13 13Z" fill="currentColor" />
                          </svg>
                        </div>
                        <p className="mb-0">{testimonial.testimonial}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-gradient text-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="display-4 fw-bold mb-4">Pronto para transformar seus treinos?</h2>
                <p className="lead mb-5">
                  Junte-se aos milhares de usuários que já estão alcançando seus objetivos com o Sistema Especialista de Academia.
                </p>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button as={Link} to="/register" variant="light" size="lg" className="rounded-pill px-5 py-3">
                    <span className="d-flex align-items-center fw-bold">
                      Comece Gratuitamente <FaArrowRight className="ms-2" />
                    </span>
                  </Button>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;