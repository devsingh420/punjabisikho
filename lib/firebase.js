import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAYNEZJ_78nboCoN2GyUApkBQboweTiMu4",
  authDomain: "punjabisikho.firebaseapp.com",
  projectId: "punjabisikho",
  storageBucket: "punjabisikho.firebasestorage.app",
  messagingSenderId: "122486710324",
  appId: "1:122486710324:web:12dc5610c1cffde80eea61",
  measurementId: "G-Z0092THQCG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
