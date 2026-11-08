// App.jsx - Simplified version
import React, { useState } from 'react';

import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import LandlordDashboard from './src/screens/LandlordDashboard';

const App = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (user.role === 'landlord') {
    return <LandlordDashboard user={user} onLogout={handleLogout} />;
  }

  return <HomeScreen user={user} onLogout={handleLogout} />;
};

export default App;