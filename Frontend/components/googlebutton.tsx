import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';

interface GoogleButtonProps {
  onPress: () => void;
  title?: string;
  style?: object;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  title = "Sign in with Google",
  style
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <Image
          source={require('../assets/google-icon.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 12,
  },
  text: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium', // You may need to ensure this font is available/linked
  }
});

export default GoogleButton;