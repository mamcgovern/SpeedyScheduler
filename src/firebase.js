import { initializeApp } from "firebase/app";
import {
    browserLocalPersistence,
    browserPopupRedirectResolver,
    initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYIn54YvuLN2msUoRC1REJ04ivd56Srkw",
  authDomain: "speedy-scheduler.firebaseapp.com",
  projectId: "speedy-scheduler",
  storageBucket: "speedy-scheduler.firebasestorage.app",
  messagingSenderId: "528492231424",
  appId: "1:528492231424:web:3cb48045bb1a68455a51e5"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
});

export const db = getFirestore(app);