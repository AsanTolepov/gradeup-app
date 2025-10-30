// src/firebase.js

// Kerakli funksiyalarni Firebase SDK'laridan import qilish
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <--- QO'SHILDI: Storage uchun import

// Sizning web ilovangizning Firebase konfiguratsiyasi
const firebaseConfig = {
  apiKey: "AIzaSyDQvNkDolAu37wfGHIYjqmJUYlhdX3Xojw",
  authDomain: "react-auth-app-f9189.firebaseapp.com",
  projectId: "react-auth-app-f9189",
  storageBucket: "react-auth-app-f9189.appspot.com", // <-- DIQQAT: Siznikida '.firebasestorage.app' edi, ko'pincha '.appspot.com' bo'ladi. Firebase konsolidan tekshiring.
  messagingSenderId: "840727997911",
  appId: "1:840727997911:web:0bc64062cfd427e4bc6f92",
  measurementId: "G-QX4WNM8VGF"
};

// Firebase'ni ishga tushirish (initsializatsiya)
const app = initializeApp(firebaseConfig);

// Firebase xizmatlarini ishga tushirish
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // <--- QO'SHILDI: Storage xizmatini ishga tushirish

// Barcha kerakli xizmatlarni bitta joydan eksport qilish.
// Bu boshqa fayllarda import qilishni osonlashtiradi.
export { auth, db, storage };