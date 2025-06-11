import React, { useState, useEffect, useContext, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Badge, Tabs, Tab, Modal, ListGroup, ProgressBar } from 'react-bootstrap';
import { FaUtensils, FaWeightHanging, FaAppleAlt, FaBreadSlice, FaFish, FaBan, FaPizzaSlice, FaChartPie, FaPlus, FaTrash, FaInfoCircle, FaCalculator, FaArrowDown, FaArrowUp, FaMinus, FaBullseye, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import dietService from '../api/diet.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Diet = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [diet, setDiet] = useState(null);
  const [foodSuggestions, setFoodSuggestions] = useState(null);
  const [mealSuggestions, setMealSuggestions] = useState(null);
  const [restrictions, setRestrictions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState(null);
  const chartRef = useRef(null);
  
  // Modal states
  const [showDietModal, setShowDietModal] = useState(false);
  const [activityLevel, setActivityLevel] = useState('Moderadamente ativo');
  const [gender, setGender] = useState('Masculino');
  const [dietApproach, setDietApproach] = useState('automatic');
  
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [restrictionType, setRestrictionType] = useState('Alergia');
  const [restrictionDescription, setRestrictionDescription] = useState('');
  
  // Buscar dados do usuário ao carregar a página
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dietResponse = await dietService.getDiet();
        if (dietResponse.success) {
          setDiet(dietResponse.diet);
          
          const suggestionsResponse = await dietService.getFoodSuggestions();
          if (suggestionsResponse.success) {
            setFoodSuggestions(suggestionsResponse.foodSuggestions);
            setMealSuggestions(suggestionsResponse.mealSuggestions);
          }
        }
        
        const restrictionsResponse = await dietService.getRestrictions();
        if (restrictionsResponse.success) {
          setRestrictions(restrictionsResponse.restrictions);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          toast.error('Erro ao carregar dados da dieta');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculadora de macros para o gráfico
  const calculateMacroCalories = () => {
    if (!diet) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round(diet.protein_g * 4),
      carbs: Math.round(diet.carbs_g * 4),
      fat: Math.round(diet.fat_g * 9)
    };
  };
  
  // Dados para o gráfico de macronutrientes
  const getChartData = () => {
    const macroCalories = calculateMacroCalories();
    
    return {
      labels: ['Proteínas', 'Carboidratos', 'Gorduras'],
      datasets: [
        {
          data: [macroCalories.protein, macroCalories.carbs, macroCalories.fat],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF5371', '#319DE4', '#FFBD45'],
        }
      ]
    };
  };
  
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} kcal (${percentage}%)`;
          }
        }
      }
    }
  };

  // Função para obter informações sobre a estratégia
  const getStrategyInfo = (strategy) => {
    const strategies = {
      'Cutting Agressivo': { color: 'danger', icon: <FaArrowDown />, intensity: 'Alto' },
      'Cutting Moderado': { color: 'warning', icon: <FaArrowDown />, intensity: 'Moderado' },
      'Cutting Conservador': { color: 'info', icon: <FaArrowDown />, intensity: 'Baixo' },
      'Lean Bulk': { color: 'success', icon: <FaArrowUp />, intensity: 'Baixo' },
      'Lean Bulk Moderado': { color: 'success', icon: <FaArrowUp />, intensity: 'Moderado' },
      'Lean Bulk Conservador': { color: 'primary', icon: <FaArrowUp />, intensity: 'Baixo' },
      'Body Recomposition': { color: 'secondary', icon: <FaMinus />, intensity: 'Especial' },
      'Mini Cut': { color: 'danger', icon: <FaArrowDown />, intensity: 'Alto' },
      'Definição Suave': { color: 'info', icon: <FaArrowDown />, intensity: 'Baixo' },
      'Manutenção Ativa': { color: 'secondary', icon: <FaMinus />, intensity: 'Mínimo' },
      'Recuperação': { color: 'primary', icon: <FaArrowUp />, intensity: 'Mínimo' },
      'Manutenção': { color: 'secondary', icon: <FaMinus />, intensity: 'Neutro' }
    };
    return strategies[strategy] || { color: 'secondary', icon: <FaMinus />, intensity: 'N/A' };
  };

  // Calcular nova dieta
  const handleCalculateDiet = async () => {
    setCalculating(true);
    try {
      const response = await dietService.calculateDiet(activityLevel, gender, dietApproach);
      if (response.success) {
        setDiet(response.diet);
        setInsights(response.insights);
        toast.success('Dieta calculada com sucesso!');
        
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
        
        setShowDietModal(false);
      } else {
        toast.error(response.message || 'Erro ao calcular dieta');
      }
    } catch (error) {
      toast.error('Erro ao comunicar com o servidor');
    } finally {
      setCalculating(false);
    }
  };
  
  // Adicionar restrição alimentar
  const handleAddRestriction = async () => {
    if (!restrictionDescription.trim()) {
      toast.warning('Por favor, informe a descrição da restrição');
      return;
    }
    
    try {
      const response = await dietService.addRestriction({
        restriction_type: restrictionType,
        description: restrictionDescription
      });
      
      if (response.success) {
        toast.success('Restrição alimentar adicionada com sucesso!');
        setRestrictions([...restrictions, response.restriction]);
        setRestrictionDescription('');
        setShowRestrictionModal(false);
        
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
      }
    } catch (error) {
      toast.error('Erro ao adicionar restrição alimentar');
    }
  };
  
  // Remover restrição
  const handleRemoveRestriction = async (id) => {
    try {
      const response = await dietService.deleteRestriction(id);
      if (response.success) {
        toast.success('Restrição removida com sucesso');
        setRestrictions(restrictions.filter(r => r.id !== id));
        
        const suggestionsResponse = await dietService.getFoodSuggestions();
        if (suggestionsResponse.success) {
          setFoodSuggestions(suggestionsResponse.foodSuggestions);
          setMealSuggestions(suggestionsResponse.mealSuggestions);
        }
      }
    } catch (error) {
      toast.error('Erro ao remover restrição');
    }
  };
  
  // Formatador para valores nutricionais
  const formatNutrient = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
  };

  // Renderizar informações estratégicas da dieta
  const renderDietStrategy = () => {
    if (!diet || !diet.strategy) return null;

    const strategyInfo = getStrategyInfo(diet.strategy);
    const weeklyChange = diet.weekly_weight_change || 0;
    const changeText = weeklyChange > 0 ? 'ganho' : weeklyChange < 0 ? 'perda' : 'manutenção';
    const changeColor = weeklyChange > 0 ? 'success' : weeklyChange < 0 ? 'danger' : 'secondary';

    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className={`bg-${strategyInfo.color} text-white`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              {strategyInfo.icon}
              <span className="ms-2">Estratégia: {diet.strategy}</span>
            </h5>
            <Badge bg="light" text="dark">
              Intensidade: {strategyInfo.intensity}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <p className="mb-3">{diet.strategy_description}</p>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Meta Semanal</h6>
                  <div className="d-flex align-items-center">
                    <Badge bg={changeColor} className="me-2 p-2">
                      {Math.abs(weeklyChange).toFixed(1)} kg/{changeText}
                    </Badge>
                    <small className="text-muted">por semana</small>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted">Ajuste Calórico</h6>
                  <div className="d-flex align-items-center">
                    <Badge bg={diet.caloric_adjustment > 0 ? 'success' : diet.caloric_adjustment < 0 ? 'danger' : 'secondary'} className="me-2 p-2">
                      {diet.caloric_adjustment > 0 ? '+' : ''}{diet.caloric_adjustment} kcal
                    </Badge>
                    <small className="text-muted">vs manutenção</small>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col md={4}>
              <div className="text-center">
                <h6 className="text-muted mb-3">Calorias de Manutenção</h6>
                <h4 className="mb-2">{formatNutrient(diet.maintenance_calories)} kcal</h4>
                <div className="d-flex justify-content-center align-items-center">
                  <FaCalculator className="text-primary me-2" />
                  <small className="text-muted">TMB × Atividade</small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  // Renderizar métricas de saúde
  const renderHealthMetrics = () => {
    if (!diet) return null;

    const bmiStatus = {
      'underweight': { label: 'Abaixo do peso', color: 'info' },
      'normal': { label: 'Peso normal', color: 'success' },
      'overweight': { label: 'Sobrepeso', color: 'warning' },
      'obese': { label: 'Obesidade', color: 'danger' }
    };

    const bmiInfo = bmiStatus[diet.bmi_category] || { label: 'N/A', color: 'secondary' };
    const proteinPerKg = insights ? insights.proteinPerKg : (diet.protein_g / currentUser.weight).toFixed(1);

    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0 d-flex align-items-center">
            <FaChartLine className="me-2" />
            Métricas de Saúde
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">IMC</h6>
                <h4>{diet.bmi}</h4>
                <Badge bg={bmiInfo.color}>{bmiInfo.label}</Badge>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">Proteína por kg</h6>
                <h4>{proteinPerKg}g</h4>
                <small className="text-muted">por kg corporal</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">TMB</h6>
                <h4>{insights ? formatNutrient(insights.bmr) : 'N/A'}</h4>
                <small className="text-muted">kcal/dia</small>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <h6 className="text-muted">Nível Atividade</h6>
                <div className="small">
                  <Badge bg="primary">{diet.activity_level}</Badge>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };
  
  // Renderizar cálculo de calorias por macronutriente
  const renderMacroCalories = () => {
    const macroCalories = calculateMacroCalories();
    const totalCals = diet ? diet.calories : 0;
    
    return (
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Proteínas</h6>
                <Badge bg="danger" className="p-2">{diet ? Math.round((macroCalories.protein / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.protein)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.protein_g)} g</p>
              <ProgressBar 
                variant="danger" 
                now={diet ? (macroCalories.protein / totalCals) * 100 : 0} 
                className="mt-2"
                style={{ height: '6px' }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Carboidratos</h6>
                <Badge bg="primary" className="p-2">{diet ? Math.round((macroCalories.carbs / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.carbs)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.carbs_g)} g</p>
              <ProgressBar 
                variant="primary" 
                now={diet ? (macroCalories.carbs / totalCals) * 100 : 0} 
                className="mt-2"
                style={{ height: '6px' }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Gorduras</h6>
                <Badge bg="warning" className="p-2">{diet ? Math.round((macroCalories.fat / totalCals) * 100) : 0}%</Badge>
              </div>
              <h3 className="mt-2">{formatNutrient(macroCalories.fat)} kcal</h3>
              <p className="text-muted">{formatNutrient(diet?.fat_g)} g</p>
              <ProgressBar 
                variant="warning" 
                now={diet ? (macroCalories.fat / totalCals) * 100 : 0} 
                className="mt-2"
                style={{ height: '6px' }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };
  
  // Renderizar seção de restrições alimentares
  const renderRestrictions = () => {
    return (
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Restrições Alimentares</h5>
          <Button size="sm" variant="light" onClick={() => setShowRestrictionModal(true)}>
            <FaPlus className="me-1" /> Adicionar
          </Button>
        </Card.Header>
        <Card.Body>
          {restrictions.length === 0 ? (
            <p className="text-center">Nenhuma restrição alimentar cadastrada</p>
          ) : (
            <ListGroup variant="flush">
              {restrictions.map(restriction => (
                <ListGroup.Item key={restriction.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <Badge bg={
                      restriction.restriction_type === 'Alergia' ? 'danger' :
                      restriction.restriction_type === 'Intolerância' ? 'warning' :
                      restriction.restriction_type === 'Preferência' ? 'info' : 'secondary'
                    } className="me-2">
                      {restriction.restriction_type}
                    </Badge>
                    {restriction.description}
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveRestriction(restriction.id)}
                  >
                    <FaTrash />
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    );
  };
  
  // Renderizar sugestões de alimentos (simplificado)
  const renderFoodSuggestions = () => {
    if (!foodSuggestions) return null;
    
    const sections = [
      { title: 'Proteínas', data: foodSuggestions.proteins, icon: <FaFish className="me-2" /> },
      { title: 'Carboidratos', data: foodSuggestions.carbs, icon: <FaBreadSlice className="me-2" /> },
      { title: 'Gorduras', data: foodSuggestions.fats, icon: <FaWeightHanging className="me-2" /> },
      { title: 'Vegetais', data: foodSuggestions.vegetables, icon: <FaAppleAlt className="me-2" /> },
      { title: 'Frutas', data: foodSuggestions.fruits, icon: <FaAppleAlt className="me-2" /> }
    ];
    
    return (
      <div className="mb-4">
        <h4 className="mb-3">Sugestões de Alimentos</h4>
        <p className="text-muted">Baseado nas suas preferências e restrições alimentares</p>
        
        <Row>
          {sections.map((section, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Header className="bg-light">
                  <h5 className="mb-0 d-flex align-items-center">
                    {section.icon}
                    {section.title}
                  </h5>
                </Card.Header>
                <Card.Body>
                  <ListGroup variant="flush">
                    {section.data && section.data.length > 0 ? (
                      section.data.slice(0, 5).map((food, i) => (
                        <ListGroup.Item key={i} className="px-0">
                          <div className="d-flex justify-content-between">
                            <span>{food.name}</span>
                            <span className="text-muted">{food.calories_per_100g} kcal/100g</span>
                          </div>
                          <div className="small text-muted">
                            P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <p className="text-center">Nenhum alimento disponível</p>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Componente para o gráfico de macronutrientes
  const MacroNutrientChart = () => {
    const chartContainer = useRef(null);
    const chartInstance = useRef(null);
    
    useEffect(() => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      if (chartContainer.current && diet) {
        const ctx = chartContainer.current.getContext('2d');
        
        chartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: getChartData(),
          options: chartOptions
        });
      }
      
      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [diet]);
    
    return (
      <div style={{ height: '300px', position: 'relative' }}>
        <canvas ref={chartContainer} />
      </div>
    );
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando dados da dieta...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Plano Alimentar Inteligente</h1>
        <div>
          <Button variant="outline-primary" className="me-2" onClick={() => setShowRestrictionModal(true)}>
            <FaBan className="me-2" />
            Restrições
          </Button>
          <Button variant="primary" onClick={() => setShowDietModal(true)}>
            <FaUtensils className="me-2" />
            {diet ? 'Recalcular' : 'Calcular'} Dieta
          </Button>
        </div>
      </div>
      
      {!diet ? (
        <Card className="text-center p-5 shadow-sm">
          <Card.Body>
            <FaPizzaSlice size={60} className="text-primary mb-3" />
            <h3>Você ainda não tem uma dieta calculada</h3>
            <p className="text-muted mb-4">
              Calcule sua dieta personalizada com base no seu objetivo, peso, altura e nível de atividade.
              Nossa calculadora usa estratégias avançadas de cutting e bulking baseadas na ciência nutricional.
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => setShowDietModal(true)}
            >
              <FaBullseye className="me-2" />
              Calcular Agora
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Informações da Estratégia */}
          {renderDietStrategy()}
          
          {/* Métricas de Saúde */}
          {renderHealthMetrics()}
          
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0 d-flex align-items-center">
                <FaChartPie className="me-2" />
                Resumo da Dieta
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h4>Meta Calórica Diária</h4>
                          <h2 className="mb-0">{formatNutrient(diet.calories)} kcal</h2>
                        </div>
                        <div className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => setShowDietModal(true)}
                          >
                            <FaCalculator className="me-1" />
                            Recalcular
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                  
                  {/* Detalhes dos Macronutrientes */}
                  {renderMacroCalories()}
                </Col>
                <Col md={4}>
                  <MacroNutrientChart />
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="overview" title="Visão Geral">
              {renderRestrictions()}
            </Tab>
            <Tab eventKey="suggestions" title="Sugestões de Alimentos">
              {renderFoodSuggestions()}
            </Tab>
          </Tabs>
        </>
      )}
      
      {/* Modal para Calcular Dieta */}
      <Modal show={showDietModal} onHide={() => setShowDietModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBullseye className="me-2" />
            Calculadora de Dieta Inteligente
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nível de Atividade Física</Form.Label>
                  <Form.Select 
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                  >
                    <option value="Sedentário">Sedentário (pouco ou nenhum exercício)</option>
                    <option value="Levemente ativo">Levemente ativo (exercício leve 1-3 dias/semana)</option>
                    <option value="Moderadamente ativo">Moderadamente ativo (exercício moderado 3-5 dias/semana)</option>
                    <option value="Muito ativo">Muito ativo (exercício intenso 6-7 dias/semana)</option>
                    <option value="Extremamente ativo">Extremamente ativo (exercício muito intenso, trabalho físico)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Gênero</Form.Label>
                  <div>
                    <Form.Check
                      inline
                      type="radio"
                      label="Masculino"
                      name="gender"
                      value="Masculino"
                      checked={gender === 'Masculino'}
                      onChange={e => setGender(e.target.value)}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      label="Feminino"
                      name="gender"
                      value="Feminino"
                      checked={gender === 'Feminino'}
                      onChange={e => setGender(e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Abordagem da Dieta</Form.Label>
                  <Form.Select 
                    value={dietApproach}
                    onChange={(e) => setDietApproach(e.target.value)}
                  >
                    <option value="automatic">🤖 Automática (Recomendada)</option>
                    <optgroup label="Cutting (Perda de Peso)">
                      <option value="aggressive_cut">🔥 Cutting Agressivo (-600 kcal)</option>
                      <option value="moderate_cut">⚖️ Cutting Moderado (-400 kcal)</option>
                      <option value="conservative_cut">🎯 Cutting Conservador (-250 kcal)</option>
                    </optgroup>
                    <optgroup label="Manutenção/Recomposição">
                      <option value="maintenance">➡️ Manutenção (0 kcal)</option>
                    </optgroup>
                    <optgroup label="Bulking (Ganho de Peso)">
                      <option value="lean_bulk">💪 Lean Bulk (+250 kcal)</option>
                      <option value="moderate_bulk">📈 Bulk Moderado (+400 kcal)</option>
                      <option value="aggressive_bulk">🚀 Bulk Agressivo (+600 kcal)</option>
                    </optgroup>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    A opção automática seleciona a melhor estratégia baseada no seu perfil.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Alert variant="info">
              <div className="d-flex align-items-start">
                <FaInfoCircle className="me-2 mt-1" />
                <div>
                  <p className="mb-1"><strong>O cálculo será baseado em:</strong></p>
                  <ul className="mb-1">
                    <li>Peso atual: <strong>{currentUser.weight} kg</strong></li>
                    <li>Altura: <strong>{currentUser.height} m</strong></li>
                    <li>Idade: <strong>{currentUser.age} anos</strong></li>
                    <li>Objetivo: <strong>{currentUser.goal}</strong></li>
                    <li>Experiência: <strong>{currentUser.experience_level}</strong></li>
                  </ul>
                  <p className="mb-0 small">
                    <strong>Nossa IA considera:</strong> IMC, composição corporal estimada, 
                    experiência em treinos e metabolismo individual para criar uma estratégia personalizada.
                  </p>
                </div>
              </div>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDietModal(false)} disabled={calculating}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCalculateDiet}
            disabled={calculating}
          >
            {calculating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Calculando...
              </>
            ) : (
              <>
                <FaBullseye className="me-1" />
                Calcular Dieta
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para Adicionar Restrição */}
      <Modal show={showRestrictionModal} onHide={() => setShowRestrictionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Restrição Alimentar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de Restrição</Form.Label>
              <Form.Select 
                value={restrictionType}
                onChange={(e) => setRestrictionType(e.target.value)}
              >
                <option value="Alergia">Alergia</option>
                <option value="Intolerância">Intolerância</option>
                <option value="Preferência">Preferência (não gosta)</option>
                <option value="Dieta">Dieta (ex: vegetariano, vegano)</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Amendoim, Lactose, Carne vermelha..."
                value={restrictionDescription}
                onChange={(e) => setRestrictionDescription(e.target.value)}
              />
              <Form.Text className="text-muted">
                Informe o alimento ou ingrediente que deseja restringir.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRestrictionModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddRestriction}>
            Adicionar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Diet;