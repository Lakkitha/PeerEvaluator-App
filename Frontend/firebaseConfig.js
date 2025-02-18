import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const firebaseConfig = {
  apiKey: 'AIzaSyA7navV_fpyk3niRG1hmEf00DLCtIk-Gg4',
  authDomain: 'peerevaluator-app.firebaseapp.com ',
  projectId: 'peerevaluator-app',
  storageBucket: 'com.peerevalapp',
  messagingSenderId: '637568203533',
  appId: '1:637568203533:android:467bd133c9199af50a8e44',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

GoogleSignin.configure({
  webClientId:
    '637568203533-micdr3ramm47f4s299tiro7t2ntm26cv.apps.googleusercontent.com',
  offlineAccess: true,
});

export {auth, googleProvider};
