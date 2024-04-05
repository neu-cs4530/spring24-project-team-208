import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const CREDENTIALS = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!CREDENTIALS) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable not set');
}

initializeApp({
  credential: cert(JSON.parse(CREDENTIALS)),
});

const db = getFirestore();
export default db;

const auth = getAuth();
export { auth };
