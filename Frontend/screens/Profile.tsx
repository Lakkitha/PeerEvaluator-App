import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {auth} from '../firebaseConfig';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../navigation/AuthStack';

type ProfileScreenProps = NativeStackScreenProps<AuthStackParamList, 'Profile'>;

const ProfileScreen = ({navigation}: ProfileScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>Email: {auth.currentUser?.email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ProfileScreen;
