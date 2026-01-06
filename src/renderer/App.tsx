import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { authService } from './services/authService';
import './styles/App.css';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <div className="app">
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};
