import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {auth} from '../firebaseConfig';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Login successful');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} disabled={isLoading} />
      </View>
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate('SignUp')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  buttonContainer: {
    marginVertical: 6,
  },
});

export default LoginScreen;
