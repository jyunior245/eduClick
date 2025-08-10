import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDyfcBWFbR-nx3hxcZNjAILDJ8mHWCY5Ic",
  authDomain: "educlick-681b9.firebaseapp.com",
  projectId: "educlick-681b9",
  storageBucket: "educlick-681b9.firebasestorage.app",
  messagingSenderId: "1018429512087",
  appId: "1:1018429512087:web:f9f42265310d3bc1168cd2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };