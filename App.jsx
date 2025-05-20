import React, {useEffect, useState } from 'react';
import { MainScreen } from './src/screens/MainScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ThemeProvider } from './src/context/ThemeProvider';
import { SplashScreen } from './src/screens/SplashScreen';

// Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };
  useEffect(()=>{
setTimeout(() => {
  setIsLoading(false);
}, 3000);
  },[])
  return (
    <ThemeProvider>
      {isLoading?<SplashScreen/> :isAuthenticated ? <MainScreen /> : <AuthScreen onLogin={handleLogin} />}
    </ThemeProvider>
  );
};

export default App;