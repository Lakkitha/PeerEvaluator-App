import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

export const LoadingSpinner = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);