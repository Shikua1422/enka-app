import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAr3oCOWKW9GHmgwqXwcsrCb4J24cg7UI",
  authDomain: "enka-app-8993c.firebaseapp.com",
  projectId: "enka-app-8993c",
  storageBucket: "enka-app-8993c.firebasestorage.app",
  messagingSenderId: "458595216039",
  appId: "1:458595216039:web:35f640bcd88a2347e94982",
  measurementId: "G-1T00BJKX40"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);