import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getMessaging, Messaging, getToken as getFcmToken, onMessage } from 'firebase/messaging';

// Parcel substitui process.env.* em build e lê .env automaticamente no root do projeto.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY as string,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.FIREBASE_APP_ID as string,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
let messaging: Messaging | null = null;
try {
  // Messaging requer contexto de navegador seguro (https) e SW
  messaging = getMessaging(app);
} catch (e) {
  console.warn('Firebase Messaging não inicializado (provável ambiente sem SW/HTTPS):', e);
}
export { app, auth, provider, messaging, getFcmToken, onMessage };