import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBbgzeCSNm6BFn7WkGnYucXA2w7psq8Gk4",
  authDomain: "preditivescore.firebaseapp.com",
  projectId: "preditivescore",
  storageBucket: "preditivescore.firebasestorage.app",
  messagingSenderId: "527729695385",
  appId: "1:527729695385:web:15cf41fd8c6b4d01c7f608",
  measurementId: "G-2T115H52V0"
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
