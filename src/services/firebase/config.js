import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { logEvent, logError } from '../logger'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app
let auth
let db

export const initFirebase = () => {
  if (app) return { app, auth, db }
  if (!firebaseConfig.apiKey) {
    logError('firebase', 'missing-config', new Error('Missing Firebase env config'))
    throw new Error('Firebase configuration missing')
  }

  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  setPersistence(auth, browserLocalPersistence).catch((err) =>
    logError('firebase', 'set-persistence', err),
  )

  logEvent('info', 'firebase', 'initialized')
  return { app, auth, db }
}