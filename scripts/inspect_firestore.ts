import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

async function inspect() {
  console.log('Inspecting Firestore...');
  const unitsRef = collection(firestore, 'units');
  const unitsSnap = await getDocs(unitsRef);
  
  for (const unitDoc of unitsSnap.docs) {
    const data = unitDoc.data();
    console.log(`Unit: ${unitDoc.id}`);
    console.log(`Keys in unit doc: ${Object.keys(data).join(', ')}`);
    if (data.members) {
      console.log(`Found 'members' field as ${Array.isArray(data.members) ? 'array' : typeof data.members} with ${data.members.length} items.`);
    }

    // Also check for subcollection just in case
    // We can't easily list subcollections with the web SDK, but we can try to fetch the path we thought was correct.
  }
}

inspect().catch(console.error);
