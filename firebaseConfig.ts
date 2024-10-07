import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: 'AIzaSyB4ChrRM8Yb_O7vaDtYnA-5MsobVQHuD7o',
    authDomain: 'todo-list-5a426.firebaseapp.com',
    projectId: 'todo-list-5a426',
    storageBucket: 'todo-list-5a426.appspot.com',
    messagingSenderId: '654503622293',
    appId: '1:654503622293:web:bcaf1125bc2f97d899cd9c',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
