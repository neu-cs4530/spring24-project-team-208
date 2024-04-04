import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

const loadJSON = (path: string) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));

const serviceAccount = loadJSON('../../firebaseAdminKey.json');

initializeApp({
  credential: cert(<ServiceAccount>serviceAccount),
});

const db = getFirestore();
export default db;

const auth = getAuth();
export { auth };
