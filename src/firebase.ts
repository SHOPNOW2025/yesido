import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA3k4ZKwIrYvjl7GxQs73UFXiLRnaHfcr0",
  authDomain: "yesido-3dd1e.firebaseapp.com",
  projectId: "yesido-3dd1e",
  storageBucket: "yesido-3dd1e.firebasestorage.app",
  messagingSenderId: "671399142472",
  appId: "1:671399142472:web:7db85dcbc6c03f89a1647d",
  measurementId: "G-9T7S4R3PSL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
