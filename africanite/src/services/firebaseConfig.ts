import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB9OEgQmHKvYUex0PvbreJUzhT2574B8kc",
  authDomain: "africanite-services.firebaseapp.com",
  projectId: "africanite-services",
  storageBucket: "africanite-services.firebasestorage.app",
  messagingSenderId: "838230157597",
  appId: "1:838230157597:web:28481bb661ba14b2f899f4",
  measurementId: "G-13433YJG3K"
};

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
