import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/css/homepage.css';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Exercises from './pages/Exercises';
import WorkoutList from './pages/WorkoutList';
import WorkoutDetails from './pages/WorkoutDetails';
import HistoryPage from './pages/HistoryPage';
import Diet from './pages/Diet';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Context
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';

// Auth guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/exercises" 
                  element={
                    <PrivateRoute>
                      <Exercises />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/workouts" 
                  element={
                    <PrivateRoute>
                      <WorkoutList />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/workouts/:id" 
                  element={
                    <PrivateRoute>
                      <WorkoutDetails />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <PrivateRoute>
                      <HistoryPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/diet" 
                  element={
                    <PrivateRoute>
                      <Diet />
                    </PrivateRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" />
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;