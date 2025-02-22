import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA7navV_fpyk3niRG1hmEf00DLCtIk-Gg4',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'peerevaluator-app',
  storageBucket: 'com.peerevalapp',
  messagingSenderId: '637568203533',
  appId: '637568203533',
};

// Initialize Firebase first
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export {auth};
