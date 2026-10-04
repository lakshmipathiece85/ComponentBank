import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCGGOi1zmFesGJNVSYZfOluK9oisWETI3k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'components-c0a20.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'components-c0a20',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'components-c0a20.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '305841933624',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:305841933624:web:4ed2cc5c01227aff94c5cd',
};

export const isFirestoreConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.trim() !== '' &&
    firebaseConfig.projectId.trim() !== ''
  );
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirestoreConfigured()) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    try {
      // Force HTTP long-polling to prevent WebSocket/gRPC streaming timeouts in iframes and proxied environments
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } catch {
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase app:', error);
  }
}

export { app, db };
export {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  type Unsubscribe,
};
