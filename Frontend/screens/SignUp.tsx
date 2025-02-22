import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {auth} from '../firebaseConfig';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type SignUpScreenProps = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUpScreen = ({navigation}: SignUpScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Signup successful');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? 'Creating account...' : 'Sign Up'}
          onPress={handleSignup}
          disabled={isLoading || !email || !password || !confirmPassword}
        />
      </View>
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate('Login')}
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

export default SignUpScreen;
