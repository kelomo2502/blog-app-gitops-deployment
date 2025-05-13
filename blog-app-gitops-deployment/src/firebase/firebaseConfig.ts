// Import Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Ensure window.__ENV__ is available
const runtimeEnv = window.__ENV__ || {};

// Use runtime configuration if available, otherwise fallback to Vite env variables
const firebaseConfig = {
  apiKey: runtimeEnv.VITE_API_KEY || import.meta.env.VITE_API_KEY,
  authDomain: runtimeEnv.VITE_AUTH_DOMAIN || import.meta.env.VITE_AUTH_DOMAIN,
  projectId: runtimeEnv.VITE_PROJECT_ID || import.meta.env.VITE_PROJECT_ID,
  storageBucket: runtimeEnv.VITE_STORAGE_BUCKET || import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: runtimeEnv.VITE_MESSAGING_SENDER_ID || import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: runtimeEnv.VITE_APP_ID || import.meta.env.VITE_APP_ID,
};

// Ensure that env-config.js is loaded before initializing Firebase
if (!firebaseConfig.apiKey) {
  console.warn("Firebase API Key is missing! Ensure env-config.js is loading correctly.");
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
