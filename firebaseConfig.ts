
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Konfigurasi Firebase Asli (Sesuai data yang kamu berikan)
const firebaseConfig = {
  apiKey: "AIzaSyCMdC1KN8Hcf2frIITQ9BAAZ2vRymhctnU",
  authDomain: "my-profile-648f4.firebaseapp.com",
  projectId: "my-profile-648f4",
  storageBucket: "my-profile-648f4.firebasestorage.app",
  messagingSenderId: "528296517186",
  appId: "1:528296517186:web:b9ff11bfbba03bd99a97db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database dan storage agar bisa dipakai di file lain
export const db = getFirestore(app);
export const storage = getStorage(app);
