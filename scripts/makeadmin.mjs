import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDuCSHQfiz5RqcRM802FuJFYvKjPgpE9Oo",
  authDomain: "mobilezone-452a9.firebaseapp.com",
  projectId: "mobilezone-452a9",
  storageBucket: "mobilezone-452a9.firebasestorage.app",
  messagingSenderId: "385461197953",
  appId: "1:385461197953:web:7f63ea6ce7c3ccef178180"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = process.argv[2];
if (!email) { console.error('Usage: node scripts/makeadmin.mjs <email>'); process.exit(1); }

const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
if (usersSnap.empty) {
  console.log(`User "${email}" not found. Register on the website first.`);
} else {
  const userDoc = usersSnap.docs[0];
  await setDoc(doc(db, 'users', userDoc.id), { role: 'super_admin' }, { merge: true });
  console.log(`✅ ${email} is now SUPER ADMIN. Log out and log back in.`);
}
process.exit(0);
