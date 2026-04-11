import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4Yo_AhNc7pRL5g11upfpASzjtHebYfZc",
  authDomain: "xenova-89b69.firebaseapp.com",
  projectId: "xenova-89b69",
  storageBucket: "xenova-89b69.firebasestorage.app",
  messagingSenderId: "274768930888",
  appId: "1:274768930888:web:566302661d81d2b3e9907d",
  measurementId: "G-ET3VBFDLK0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();
