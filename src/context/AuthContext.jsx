import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  loginWithEmail,
  loginWithGoogle,
  logout as firebaseLogout,
  observeAuth,
  registerWithEmail,
  resetPassword,
  sendVerification,
  reloadSessionUser,
  auth,
} from '../services/firebase/auth'
import {
  ensureUserDocument,
  getUserProfile,
  updateUserProfile as updateProfileDoc,
} from '../services/firebase/firestore'
import { logEvent, logError } from '../services/logger'
import { clearGuestCart } from '../services/localCart'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  register: async () => {},
  login: async () => {},
  loginGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
  resetPassword: async () => {},
  sendVerification: async () => {},
  refreshUser: async () => {},
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  const loadProfile = async (uid) => {
    if (!uid) return
    setLoading(true)
    try {
      const data = await getUserProfile(uid)
      if (!data) {
        // If profile missing (e.g., first-time Google login), create a default doc
        await ensureUserDocument(
          {
            uid,
            email: auth.currentUser?.email,
            displayName: auth.currentUser?.displayName,
            emailVerified: auth.currentUser?.emailVerified,
          },
          'user',
          {
            isVerified: auth.currentUser?.emailVerified ?? false,
            isActive: true,
            requestedRole: null,
          },
        )
        const created = await getUserProfile(uid)
        setProfile(created || null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      logError('auth', 'profile-load-error', error, { userId: uid })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = observeAuth(async (fbUser) => {
      setUser(fbUser)
      if (fbUser) {
        clearGuestCart()
        await ensureUserDocument(fbUser)
        await loadProfile(fbUser.uid)
      } else {
        setProfile(null)
      }
      logEvent('info', 'auth', 'session-changed', { userId: fbUser?.uid })
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const register = async (payload) => {
    try {
      const newUser = await registerWithEmail(payload)
      await loadProfile(newUser.uid)
      return newUser
    } catch (error) {
      logError('auth', 'register-error', error)
      throw error
    }
  }

  const login = async (payload) => {
    try {
      const loggedIn = await loginWithEmail(payload)
      if (loggedIn?.uid) {
        await ensureUserDocument(loggedIn, 'user', {
          isVerified: loggedIn.emailVerified ?? false,
          isActive: true,
        })
        await loadProfile(loggedIn.uid)
      }
      return loggedIn
    } catch (error) {
      logError('auth', 'login-error', error)
      throw error
    }
  }

  const loginGoogle = async () => {
    try {
      const loggedIn = await loginWithGoogle()
      if (loggedIn?.uid) {
        await ensureUserDocument(loggedIn, 'user', {
          isVerified: loggedIn.emailVerified ?? false,
          isActive: true,
        })
        await loadProfile(loggedIn.uid)
      }
      return loggedIn
    } catch (error) {
      logError('auth', 'google-login-error', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
      setUser(null)
    } catch (error) {
      logError('auth', 'logout-error', error)
      throw error
    }
  }

  const updateProfile = async (data) => {
    if (!user?.uid) return
    try {
      await updateProfileDoc(user.uid, data)
      await loadProfile(user.uid)
    } catch (error) {
      logError('auth', 'profile-update-error', error, { userId: user.uid })
      throw error
    }
  }

  const handleResetPassword = async (email) => {
    await resetPassword(email)
  }

  const handleSendVerification = async () => {
    await sendVerification()
  }

  const refreshUser = async () => {
    try {
      const refreshed = await reloadSessionUser()
      setUser(refreshed)
      return refreshed
    } catch (error) {
      logError('auth', 'refresh-user-failed', error)
      throw error
    }
  }

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      register,
      login,
      loginGoogle,
      logout,
      refreshProfile: loadProfile,
      updateProfile,
      resetPassword: handleResetPassword,
      sendVerification: handleSendVerification,
      refreshUser,
    }),
    [user, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
