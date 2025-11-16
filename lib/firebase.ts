// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBv_FHwZzOyGP8bzjVwTymGkMmBUylWIDI",
  authDomain: "ibarangay-56ac3.firebaseapp.com",
  projectId: "ibarangay-56ac3",
  storageBucket: "ibarangay-56ac3.appspot.com",
  messagingSenderId: "326045443672",
  appId: "1:326045443672:web:3e9012389f99fcd87e4c2d",
  measurementId: "G-4QWWP9TCML",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
