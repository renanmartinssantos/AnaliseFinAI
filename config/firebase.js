import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";
// Firebase config
const firebaseConfig = {
  apiKey: "",
  authDomain: "preditivescore.firebaseapp.com",
  projectId: "preditivescore",
  storageBucket: "preditivescore.firebasestorage.app",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
