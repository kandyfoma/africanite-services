import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// Firebase configuration from environment variables
// See .env.example for required variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB9OEgQmHKvYUex0PvbreJUzhT2574B8kc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "africanite-services.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "africanite-services",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "africanite-services.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "838230157597",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:838230157597:web:28481bb661ba14b2f899f4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-13433YJG3K"
};

// Validate that required Firebase config is available
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "") {
  console.warn("⚠️  Firebase API Key not found. Check your .env file for VITE_FIREBASE_API_KEY");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Cloud Functions
export const functions = getFunctions(app, "us-central1");

// Callable functions
export const sendInvoiceEmail = httpsCallable(functions, "sendInvoiceEmail");
export const getScheduledInvoices = httpsCallable(functions, "getScheduledInvoices");
export const saveScheduledInvoice = httpsCallable(functions, "saveScheduledInvoice");
export const deleteScheduledInvoice = httpsCallable(functions, "deleteScheduledInvoice");

export default app;
