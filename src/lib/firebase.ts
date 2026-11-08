import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgxtomCTjLn5YUY6-7cXgx62YfBNJI5Hs",
  authDomain: "mavlone.firebaseapp.com",
  projectId: "mavlone",
  storageBucket: "mavlone.firebasestorage.app",
  messagingSenderId: "337549377255",
  appId: "1:337549377255:web:f0b099b34cd9d0917a2c42",
  measurementId: "G-E8238R9RXV",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup };
