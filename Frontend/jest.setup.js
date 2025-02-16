/* global jest */
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock the NavigationContainer
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: jest.fn(({children}) => children),
}));

// Mock the Stack Navigator
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: jest.fn(({children}) => children),
    Screen: jest.fn(),
  })),
}));
