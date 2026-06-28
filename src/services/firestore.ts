import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product, Order, AppUser, Category, Delivery } from '../types';

// --- Users ---
export async function getAllUsers(): Promise<AppUser[]> {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => d.data() as AppUser);
}

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function updateUserRole(uid: string, role: AppUser['role']): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function updateUserStatus(uid: string, status: AppUser['status']): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { status });
}

// --- Products ---
export async function getProducts(extraConstraints: QueryConstraint[] = []): Promise<Product[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    ...extraConstraints,
  ];
  const q = query(collection(db, 'products'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null;
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id: string): Promise<void> {
  await updateDoc(doc(db, 'products', id), { status: 'inactive' });
}

export async function getSellerProducts(sellerId: string): Promise<Product[]> {
  const q = query(
    collection(db, 'products'),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
}

// --- Orders ---
export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), order);
  return docRef.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getSellerOrders(sellerId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
}

export async function updateOrderStatus(id: string, status: Order['status'], deliveryPersonId?: string): Promise<void> {
  const data: Partial<Order> = { status, updatedAt: Date.now() };
  if (deliveryPersonId) data.deliveryPersonId = deliveryPersonId;
  await updateDoc(doc(db, 'orders', id), data);
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(collection(db, 'categories'));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category));
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), category);
  return docRef.id;
}

// --- Deliveries ---
export async function getDeliveriesForPerson(personId: string): Promise<Delivery[]> {
  const q = query(
    collection(db, 'deliveries'),
    where('deliveryPersonId', '==', personId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Delivery));
}

export async function getAllDeliveries(): Promise<Delivery[]> {
  const q = query(collection(db, 'deliveries'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Delivery));
}

export async function createDelivery(delivery: Omit<Delivery, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'deliveries'), delivery);
  return docRef.id;
}

export async function updateDeliveryStatus(id: string, status: Delivery['status']): Promise<void> {
  await updateDoc(doc(db, 'deliveries', id), { status, updatedAt: Date.now() });
}
