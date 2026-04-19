import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const missingKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
].filter(key => !import.meta.env[key]);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration keys missing: ${missingKeys.join(', ')}. Please set these in Netlify environment variables.`);
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIza_MISSING",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "MISSING.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "MISSING",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "MISSING.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:0000000:web:ffffffff",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
