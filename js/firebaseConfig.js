import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjEHmeYavVWnPlXnaj71IjHFRfxnq7EQw",
  authDomain: "draw-244f7.firebaseapp.com",
  projectId: "draw-244f7",
  storageBucket: "draw-244f7.firebasestorage.app",
  messagingSenderId: "1061541822600",
  appId: "1:1061541822600:web:b66b5ff1b1cd7845d65f3d",
  measurementId: "G-MM5V8XQ801"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

//test2