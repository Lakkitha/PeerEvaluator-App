import {initializeApp} from 'firebase/app';
import {initializeAuth, getReactNativePersistence} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyB66-873mizJ1rLhoN0HUM0t2B72v-EZGg',
  authDomain: '637568203533-3epjfnrskepquq0i1mrpjv0f3q4rig5t.apps.googleusercontent.com',
  projectId: 'peerevaluator-app',
  storageBucket: '"peerevaluator-app.firebasestorage.app',
  messagingSenderId: '1:637568203533:android:467bd133c9199af50a8e44',
  appId: '637568203533-micdr3ramm47f4s299tiro7t2ntm26cv.apps.googleusercontent.com',
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export {auth};
