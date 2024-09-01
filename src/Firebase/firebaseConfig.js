import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYe1p3UhoKlrUV6Q0v3S4_RDbQhkYv-pU",
  authDomain: "house-finder-ee79b.firebaseapp.com",
  projectId: "house-finder-ee79b",
  storageBucket: "house-finder-ee79b.appspot.com",
  messagingSenderId: "770189499632",
  appId: "1:770189499632:web:2ea679a73dacb4d0cbf635",
  measurementId: "G-BVZ7XQ2R78",
  databaseURL:
    "https://house-finder-ee79b-default-rtdb.europe-west1.firebasedatabase.app",
};

// inizializzo firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
