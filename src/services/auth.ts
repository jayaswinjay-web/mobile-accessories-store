import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AppUser, UserRole } from '../types';

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<AppUser> {
  const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  await updateProfile(credential.user, { displayName });

  const newUser: AppUser = {
    uid,
    email,
    displayName,
    role,
    createdAt: Date.now(),
    status: 'active',
  };

  await setDoc(doc(db, 'users', uid), newUser);
  return newUser;
}

export async function loginUser(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;
  const userDoc = await getDoc(doc(db, 'users', uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found. Contact admin.');
  }

  const userData = userDoc.data() as AppUser;
  if (userData.status === 'suspended') {
    await signOut(auth);
    throw new Error('Your account has been suspended. Contact admin.');
  }

  return userData;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUserData(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? (userDoc.data() as AppUser) : null;
}
