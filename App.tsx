
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scan from './pages/Scan';
import History from './pages/History';
import Profile from './pages/Profile';
import { AuthState, User } from './types';
import { Language } from './services/translations';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  const [language, setLanguage] = useState<Language>(
    (localStorage.getItem('poki_lang') as Language) || 'en'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('poki_theme') === 'dark'
  );

  useEffect(() => {
    const savedUser = localStorage.getItem('poki_user');
    if (savedUser) {
      setAuthState({ user: JSON.parse(savedUser), isAuthenticated: true });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('poki_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('poki_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const login = (user: User) => {
    localStorage.setItem('poki_user', JSON.stringify(user));
    setAuthState({ user, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('poki_user');
    setAuthState({ user: null, isAuthenticated: false });
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={authState.isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={login} />} 
        />
        <Route 
          path="/dashboard" 
          element={authState.isAuthenticated ? (
            <Dashboard 
              user={authState.user!} 
              lang={language} 
              isDark={isDarkMode} 
              setLang={setLanguage} 
              toggleTheme={toggleTheme} 
            />
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/scan" 
          element={authState.isAuthenticated ? (
            <Scan 
              user={authState.user!} 
              lang={language} 
              isDark={isDarkMode} 
              setLang={setLanguage} 
              toggleTheme={toggleTheme} 
            />
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={authState.isAuthenticated ? (
            <History 
              lang={language} 
              isDark={isDarkMode} 
              setLang={setLanguage} 
              toggleTheme={toggleTheme} 
            />
          ) : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={authState.isAuthenticated ? (
            <Profile 
              user={authState.user!} 
              onLogout={logout} 
              lang={language} 
              isDark={isDarkMode} 
              setLang={setLanguage} 
              toggleTheme={toggleTheme} 
            />
          ) : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
