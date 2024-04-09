import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBBLiScWAIK7a5R4LLYBrJxOGmqRJ8VFDM',
  authDomain: 'covey-town-battleship.firebaseapp.com',
  projectId: 'covey-town-battleship',
  storageBucket: 'covey-town-battleship.appspot.com',
  messagingSenderId: '806290790133',
  appId: '1:806290790133:web:600956ab3407e0856a97bc',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;

const db = getFirestore(app);

export { db };
