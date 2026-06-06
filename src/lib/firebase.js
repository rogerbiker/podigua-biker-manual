import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDLCWo0UCMsQPFecNZuILCAcv_B_A4HhWA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-learning-tracker-b7948.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-learning-tracker-b7948",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-learning-tracker-b7948.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "318520310355",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:318520310355:web:b42a15141f931f9b57a4a6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database with auto-detect long-polling to prevent WebSocket timeouts on mobile networks
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
});

