import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA7navV_fpyk3niRG1hmEf00DLCtIk-Gg4',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'peerevaluator-app',
  storageBucket: 'com.peerevalapp',
  messagingSenderId: '637568203533',
  appId: '637568203533',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth};
