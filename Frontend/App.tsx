import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './context/AuthContext';
import AuthStack from './navigation/AuthStack';
import AppNavigator from './navigation/AppNavigator';
import {useAuth} from './hooks/useAuth';

function App(): React.JSX.Element {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        {user ? <AuthStack /> : <AppNavigator />}
      </NavigationContainer>
    </AuthProvider>
  );
}
