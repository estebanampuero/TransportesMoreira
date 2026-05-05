import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp
let db: Firestore
let analytics: Analytics | null = null

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

db = getFirestore(app)
export const storage = getStorage(app)

isSupported().then((supported) => {
  if (supported) analytics = getAnalytics(app)
})

export interface LeadData {
  name: string
  phone: string
  email: string
  message: string
}

export async function saveLead(data: LeadData): Promise<void> {
  await addDoc(collection(db, 'leads'), {
    ...data,
    createdAt: serverTimestamp(),
    source: 'web_form',
    url: window.location.href,
  })
}

export { db, analytics }
