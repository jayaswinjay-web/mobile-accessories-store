import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import readline from 'readline';

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
const auth = getAuth(app);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

const CATEGORIES = [
  { name: 'Phone Cases', description: 'Protective cases for all smartphone models' },
  { name: 'Chargers', description: 'Wall chargers, wireless chargers, and charging docks' },
  { name: 'Cables', description: 'USB-C, Lightning, and micro-USB cables' },
  { name: 'Headphones', description: 'Wired and wireless headphones & earphones' },
  { name: 'Screen Protectors', description: 'Tempered glass and film screen protectors' },
  { name: 'Power Banks', description: 'Portable chargers for on-the-go power' },
  { name: 'Smart Watches', description: 'Wearable smartwatches and fitness bands' },
  { name: 'Mobile Stands', description: 'Phone stands, holders, and grips' },
];

const PRODUCTS = [
  {
    name: 'Spigen Ultra Hybrid Case for iPhone 16 Pro Max',
    description: 'Clear protective case with military-grade drop protection and Air Cushion Technology. Compatible with iPhone 16 Pro Max.',
    price: 2499,
    category: 'Phone Cases',
    brand: 'Spigen',
    stockQuantity: 50,
  },
  {
    name: 'Apple 20W USB-C Power Adapter',
    description: 'Official Apple 20W USB-C power adapter. Fast charging compatible with iPhone and iPad.',
    price: 1900,
    category: 'Chargers',
    brand: 'Apple',
    stockQuantity: 100,
  },
  {
    name: 'Samsung 45W Super Fast Charging Travel Adapter',
    description: 'Official Samsung 45W PD charger with USB-C. Supports Super Fast Charging 2.0 for Galaxy devices.',
    price: 2499,
    category: 'Chargers',
    brand: 'Samsung',
    stockQuantity: 75,
  },
  {
    name: 'Anker PowerLine III USB-C to USB-C Cable (6ft)',
    description: 'Durable braided USB-C cable with 60W Power Delivery support. Data transfer up to 480Mbps.',
    price: 1299,
    category: 'Cables',
    brand: 'Anker',
    stockQuantity: 200,
  },
  {
    name: 'Apple Lightning to USB-C Cable (1m)',
    description: 'Official Apple MFi certified Lightning to USB-C cable for fast charging and data sync.',
    price: 1900,
    category: 'Cables',
    brand: 'Apple',
    stockQuantity: 150,
  },
  {
    name: 'boAt Airdopes 141 Pro TWS Earbuds',
    description: 'Wireless earbuds with 50 hours playback, ENx noise cancellation, and ASAP charging. IPX5 rated.',
    price: 1799,
    category: 'Headphones',
    brand: 'boAt',
    stockQuantity: 120,
  },
  {
    name: 'Samsung Galaxy Buds3 Pro',
    description: 'Premium wireless earbuds with 2-way speakers, adaptive ANC, blade light design, and up to 26 hours battery.',
    price: 14999,
    category: 'Headphones',
    brand: 'Samsung',
    stockQuantity: 40,
  },
  {
    name: 'OnePlus Nord Buds 3',
    description: 'True wireless earbuds with 12.4mm drivers, dual mic AI noise cancellation, and 43 hours battery life.',
    price: 2199,
    category: 'Headphones',
    brand: 'OnePlus',
    stockQuantity: 80,
  },
  {
    name: 'Spigen Glas.tR EZ Fit Tempered Glass for iPhone 16 Pro',
    description: 'Easy installation tempered glass screen protector with oleophobic coating and 9H hardness.',
    price: 1799,
    category: 'Screen Protectors',
    brand: 'Spigen',
    stockQuantity: 90,
  },
  {
    name: 'Mi Power Bank 3i 20000mAh',
    description: '20000mAh lithium polymer power bank with 18W fast charging, dual USB output, and micro-USB/USB-C input.',
    price: 1799,
    category: 'Power Banks',
    brand: 'Xiaomi',
    stockQuantity: 60,
  },
  {
    name: 'Anker 325 Power Bank 20000mAh',
    description: 'High-capacity 20000mAh portable charger with dual USB ports and PowerIQ technology.',
    price: 2999,
    category: 'Power Banks',
    brand: 'Anker',
    stockQuantity: 45,
  },
  {
    name: 'Noise ColorFit Pro 5 Smart Watch',
    description: '1.85" AMOLED display smartwatch with Bluetooth calling, 100+ sports modes, and 7 days battery.',
    price: 2999,
    category: 'Smart Watches',
    brand: 'Noise',
    stockQuantity: 70,
  },
  {
    name: 'boAt Wave Call 2 Smart Watch',
    description: '1.83" HD display smartwatch with Bluetooth calling, heart rate monitor, SpO2 tracking, and IP67 rating.',
    price: 1999,
    category: 'Smart Watches',
    brand: 'boAt',
    stockQuantity: 85,
  },
  {
    name: 'ESR HaloLock Qi2 Wireless Charging Stand',
    description: '15W fast wireless charging stand with magnetic alignment. Compatible with MagSafe cases.',
    price: 3499,
    category: 'Chargers',
    brand: 'ESR',
    stockQuantity: 35,
  },
  {
    name: 'PopSockets PopGrip Phone Stand',
    description: 'Expandable phone grip and stand with swappable tops. Adheres to most phones and cases.',
    price: 999,
    category: 'Mobile Stands',
    brand: 'PopSockets',
    stockQuantity: 150,
  },
];

async function seed() {
  console.log('Seeding Firestore database...\n');

  // Seed Categories
  console.log('Adding categories...');
  let catIndex = 0;
  for (const cat of CATEGORIES) {
    await addDoc(collection(db, 'categories'), {
      name: cat.name,
      description: cat.description,
    });
    catIndex++;
    process.stdout.write(`\r  ${catIndex}/${CATEGORIES.length} categories added`);
  }
  console.log('\n');

  // Get categories to map IDs
  const catSnapshot = await getDocs(collection(db, 'categories'));
  const catMap = {};
  catSnapshot.forEach(d => { catMap[d.data().name] = d.id; });

  // Seed Products (need a placeholder sellerId - will associate with first seller user)
  console.log('Adding products...');
  let prodIndex = 0;
  for (const prod of PRODUCTS) {
    await addDoc(collection(db, 'products'), {
      ...prod,
      images: [],
      sellerId: 'seed-admin',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
    });
    prodIndex++;
    process.stdout.write(`\r  ${prodIndex}/${PRODUCTS.length} products added`);
  }
  console.log('\n');

  // Make user admin
  const email = await ask('Enter your registered email to make you admin: ');
  if (email && email.includes('@')) {
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
      if (usersSnap.empty) {
        console.log(`\nUser "${email}" not found. Register on the website first, then I can update your role.`);
      } else {
        const userDoc = usersSnap.docs[0];
        await setDoc(doc(db, 'users', userDoc.id), { role: 'super_admin' }, { merge: true });
        console.log(`\n✅ User "${email}" is now SUPER ADMIN. Log out and log back in.`);
      }
    } catch (err) {
      console.error('Error updating user role:', err.message);
    }
  }

  console.log('\n✅ Seeding complete!');
  rl.close();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
