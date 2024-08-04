// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmr3_3lyZT9uL8rqbkBLyzNk8ua6pbwEE",
  authDomain: "hspantryapp-91382.firebaseapp.com",
  projectId: "hspantryapp-91382",
  storageBucket: "hspantryapp-91382.appspot.com",
  messagingSenderId: "1064945508547",
  appId: "1:1064945508547:web:a61c0309ce060ac3b44276"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export {app, firestore}