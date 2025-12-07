import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDg1MsnojbsqjyooUt2uGEbUqRHogy5ZTk",
  authDomain: "chatslack.firebaseapp.com",
  projectId: "chatslack",
  storageBucket: "chatslack.firebasestorage.app",
  messagingSenderId: "559568583292",
  appId: "1:559568583292:web:12ae50403b7b0b2d0aa7f9",
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
