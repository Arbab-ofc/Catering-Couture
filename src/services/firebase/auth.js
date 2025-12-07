import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
} from 'firebase/auth'
import { initFirebase } from './config'
import { logEvent, logError } from '../logger'
import { ensureUserDocument, getUserProfile, getAdminSecret } from './firestore'

const provider = new GoogleAuthProvider()

export const { auth } = initFirebase()

export const observeAuth = (callback) => onAuthStateChanged(auth, callback)

export const registerWithEmail = async ({
  email,
  password,
  name,
  phone,
  role,
  adminSecret,
}) => {
  try {
    if (role === 'admin') {
      const secret = await getAdminSecret()
      if (adminSecret !== secret) {
        throw new Error('Invalid admin secret code')
      }
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: name })
    await ensureUserDocument(cred.user, role || 'user', {
      phone,
      isVerified: false,
      isActive: true,
      requestedRole: null,
    })
    await sendEmailVerification(cred.user)
    logEvent('info', 'auth', 'verification-sent', { userId: cred.user.uid })
    logEvent('info', 'auth', 'register-success', {
      userId: cred.user.uid,
      email,
      phone,
      role,
    })
    return cred.user
  } catch (error) {
    logError('auth', 'register-failed', error, { email })
    throw error
  }
}

export const loginWithEmail = async ({ email, password }) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await reload(cred.user)

    const profile = await getUserProfile(cred.user.uid)
    const isVerified = cred.user.emailVerified || profile?.isVerified
    const isActive = profile?.isActive ?? true

    await ensureUserDocument(cred.user, profile?.role || 'user', {
      isVerified,
      isActive,
    })

    if (!isVerified) {
      await signOut(auth)
      throw new Error('Please verify your email before logging in.')
    }

    if (!isActive) {
      await signOut(auth)
      throw new Error('Your account is inactive. Contact support.')
    }

    logEvent('info', 'auth', 'login-success', {
      userId: cred.user.uid,
      email,
    })
    return cred.user
  } catch (error) {
    logError('auth', 'login-failed', error, { email })
    throw error
  }
}

export const loginWithGoogle = async () => {
  try {
    const cred = await signInWithPopup(auth, provider)
    const profile = await getUserProfile(cred.user.uid)
    const isVerified = cred.user.emailVerified ?? profile?.isVerified ?? true
    const isActive = profile?.isActive ?? true

    await ensureUserDocument(cred.user, profile?.role || 'user', {
      isVerified,
      isActive,
    })

    if (!isActive) {
      await signOut(auth)
      throw new Error('Your account is inactive. Contact support.')
    }

    logEvent('info', 'auth', 'google-login-success', { userId: cred.user.uid })
    return cred.user
  } catch (error) {
    logError('auth', 'google-login-failed', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await signOut(auth)
    logEvent('info', 'auth', 'logout-success')
  } catch (error) {
    logError('auth', 'logout-failed', error)
    throw error
  }
}

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    logEvent('info', 'auth', 'password-reset', { email })
  } catch (error) {
    logError('auth', 'password-reset-failed', error, { email })
    throw error
  }
}

export const sendVerification = async () => {
  try {
    if (!auth.currentUser) throw new Error('No authenticated user')
    await sendEmailVerification(auth.currentUser)
    logEvent('info', 'auth', 'verification-sent', { userId: auth.currentUser.uid })
  } catch (error) {
    logError('auth', 'verification-send-failed', error)
    throw error
  }
}

export const reloadSessionUser = async () => {
  if (!auth.currentUser) return null
  await reload(auth.currentUser)
  return auth.currentUser
}