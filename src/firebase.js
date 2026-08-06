import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

// Firebase Configuration
// Environment variables can be set in Vercel or .env file (VITE_FIREBASE_...)
// Default values allow out-of-the-box working setup for CateringOrders
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_CateringOrders_DefaultKey",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "catering-orders-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "catering-orders-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "catering-orders-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "839401829102",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:839401829102:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const TEMPLATES_DOC_PATH = ["catering_settings", "templates"];

/**
 * Subscribe to real-time updates for templates in Firestore
 * @param {Function} onUpdate Callback when data changes
 * @param {Function} onError Callback when error occurs
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTemplates = (onUpdate, onError) => {
  const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.templates) {
        onUpdate(data.templates);
      }
    } else {
      // Document doesn't exist yet
      onUpdate(null);
    }
  }, (err) => {
    console.warn("Firestore subscription error / Offline mode:", err);
    if (onError) onError(err);
  });
};

/**
 * Save templates to Firestore
 * @param {Object} templatesData 
 */
export const saveTemplatesToCloud = async (templatesData) => {
  const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
  await setDoc(docRef, {
    templates: templatesData,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Fetch templates once from Firestore
 */
export const getCloudTemplates = async () => {
  const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().templates;
  }
  return null;
};
