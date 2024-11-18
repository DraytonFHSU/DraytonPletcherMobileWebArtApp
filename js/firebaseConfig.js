import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDr23_0FriqT_1t48U2OmnIIBWrbwtqj-E",
  authDomain: "draw-588bd.firebaseapp.com",
  projectId: "draw-588bd",
  storageBucket: "draw-588bd.firebasestorage.app",
  messagingSenderId: "964811174555",
  appId: "1:964811174555:web:e824404d6324e8407dcc3e",
  measurementId: "G-6QLR5FMCWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };