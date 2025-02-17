import React from 'react';
import {View, Text, Button, StyleSheet} from 'react-native';
import {auth} from '../firebaseConfig';

const ProfileScreen = () => {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email: {auth.currentUser?.email}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};