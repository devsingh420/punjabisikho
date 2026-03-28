import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs, query, where,
  serverTimestamp, arrayUnion, increment
} from 'firebase/firestore';
import { auth, db } from './firebase';

export async function signUp({ email, password, fname, lname, gender, dob, role, face, color }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await sendEmailVerification(cred.user);
  await setDoc(doc(db, 'users', uid), {
    fname, lname, email, gender, dob, role,
    face: face || '', color: color || '#FF9500',
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'progress', uid), {
    xp: 0, streak: 0, lastDate: null, done: [],
  });
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerification() {
  if (auth.currentUser) await sendEmailVerification(auth.currentUser);
}

export async function checkVerified() {
  if (auth.currentUser) {
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  }
  return false;
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function getProgress(uid) {
  const snap = await getDoc(doc(db, 'progress', uid));
  if (snap.exists()) {
    const data = snap.data();
    // Map xp to ladoos for backwards compatibility
    return {
      ...data,
      ladoos: data.ladoos ?? data.xp ?? 0,
      streak: data.streak ?? 0,
      done: data.done ?? [],
    };
  }
  return { ladoos: 0, xp: 0, streak: 0, lastDate: null, done: [] };
}

export async function completeTask(uid, taskId, ladooAmount) {
  await updateDoc(doc(db, 'progress', uid), {
    done: arrayUnion(taskId),
    xp: increment(ladooAmount),
    ladoos: increment(ladooAmount),
    lastDate: new Date().toDateString(),
  });
}

export async function addLadoos(uid, amount) {
  if (!uid || amount <= 0) return;
  await updateDoc(doc(db, 'progress', uid), {
    xp: increment(amount),
    ladoos: increment(amount),
    lastDate: new Date().toDateString(),
  });
}

export async function updateStreak(uid) {
  const progress = await getProgress(uid);
  const today = new Date().toDateString();
  if (progress.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = progress.lastDate === yesterday ? progress.streak + 1 : 1;
    await updateDoc(doc(db, 'progress', uid), { streak: newStreak, lastDate: today });
    return newStreak;
  }
  return progress.streak;
}

export async function getAllStudents() {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snap = await getDocs(q);
  const students = [];
  for (const userDoc of snap.docs) {
    const userData = userDoc.data();
    const progressSnap = await getDoc(doc(db, 'progress', userDoc.id));
    const progressData = progressSnap.exists() ? progressSnap.data() : { xp: 0, ladoos: 0, streak: 0, done: [] };
    // Ensure ladoos is set
    const ladoos = progressData.ladoos ?? progressData.xp ?? 0;
    students.push({ uid: userDoc.id, ...userData, ...progressData, ladoos });
  }
  return students;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
