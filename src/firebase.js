// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARFTWQ5oMPj5YjvPMYl9DTxUUIt0NE69E",
  authDomain: "pan-project-e945f.firebaseapp.com",
  databaseURL: "https://pan-project-e945f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pan-project-e945f",
  storageBucket: "pan-project-e945f.firebasestorage.app",
  messagingSenderId: "934647313209",
  appId: "1:934647313209:web:fcdc8d3849222cf934eee8",
  measurementId: "G-4B7VVQKRDY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);