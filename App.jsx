import React, {useState } from 'react';
import { ThemeContext } from './src/context/ThemeContext';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ThemeProvider } from './src/context/ThemeProvider';


// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? <MainScreen /> : <AuthScreen onLogin={handleLogin} />}
    </ThemeProvider>
  );
};

export default App;