import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../screens/Login';
import SignUpScreen from '../screens/SignUp';
import HomeScreen from '../screens/Home';
import ProfileScreen from '../screens/Profile';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type AuthStackParamList = {
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
      <AuthStack.Navigator>
        <AuthStack.Screen name="Home" component={HomeScreen} />
        <AuthStack.Screen name="Profile" component={ProfileScreen} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
