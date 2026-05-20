import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3N1m02ZADuJWMURz7BqoJPuOvTHepjpw",
  authDomain: "cue-app-4d240.firebaseapp.com",
  projectId: "cue-app-4d240",
  storageBucket: "cue-app-4d240.firebasestorage.app",
  messagingSenderId: "859475231340",
  appId: "1:859475231340:web:77ac82f7c4671a979bce49",
  measurementId: "G-9LDM9E9MH4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();