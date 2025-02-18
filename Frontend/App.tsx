import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './context/AuthContext';
import AuthStack from './navigation/AuthStack';
import AppNavigator from './navigation/AppNavigator';
import {useAuth} from './hooks/useAuth';
import {View, ActivityIndicator} from 'react-native';

const LoadingScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ActivityIndicator size="large" />
  </View>
);

function AppContent(): React.JSX.Element {
  const {user, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <AuthStack /> : <AppNavigator />;
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
