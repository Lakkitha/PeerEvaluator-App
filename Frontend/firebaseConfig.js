import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB66-873mizJ1rLhoN0HUM0t2B72v-EZGg',
  authDomain: 'peerevaluator-app.firebaseapp.com',
  projectId: 'peerevaluator-app',
  storageBucket: 'peerevaluator-app.firebasestorage.app',
  messagingSenderId: '637568203533',
  appId: '1:637568203533:android:467bd133c9199af50a8e44',
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export {auth};