import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ViewStyle,
  View,
} from 'react-native';

interface GoogleButtonProps {
  onPress: () => void;
  title?: string;
  style?: ViewStyle;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  title = 'Sign in with Google',
  style,
}) => {
  // Using a try-catch block to handle potential missing assets
  const renderGoogleIcon = () => {
    try {
      return (
        <Image
          source={require('../assets/google-icon.png')}
          style={styles.icon}
        />
      );
    } catch (error) {
      console.warn('Google icon asset not found:', error);
      // Return a text "G" as fallback
      return <Text style={styles.iconFallback}>G</Text>;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.contentContainer}>
        {renderGoogleIcon()}
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  iconFallback: {
    width: 24,
    height: 24,
    marginRight: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4', // Google blue color
  },
  text: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium', // You may need to ensure this font is available/linked
  },
});

export default GoogleButton;
