import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with experimentalForceLongPolling to improve connectivity in sandboxed environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  host: "firestore.googleapis.com",
  ssl: true,
}, firebaseConfig.firestoreDatabaseId);

const auth = getAuth(app);
const storage = getStorage(app);

// Connection test as per guidelines
async function testConnection() {
  try {
    console.log("Testing Firestore connection...");
    // Use getDocFromServer to bypass cache and force a network request
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.error("Firestore connection failed: The client is offline. This might be a temporary network issue or the database is still provisioning.");
      } else if (error.message.includes('permission-denied')) {
        console.warn("Firestore connection test: Permission denied (expected if 'test/connection' is protected). Connection is likely working.");
      } else {
        console.error("Firestore connection test error:", error.message);
      }
    }
  }
}
testConnection();

export { db, auth, storage };
