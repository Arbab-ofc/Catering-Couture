import {
  addDoc,
  increment,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { initFirebase } from './config'
import { logError, logEvent } from '../logger'

export const { db } = initFirebase()

export const ensureUserDocument = async (user, role = 'user', extra = {}) => {
  if (!user?.uid) return
  const ref = doc(db, 'users', user.uid)
  let isActive = extra?.isActive ?? true
  let isVerified = extra?.isVerified ?? user.emailVerified ?? false
  let roleToSet = role
  const requestedRole = extra?.requestedRole ?? null
  try {
    const existing = await getDoc(ref)
    if (existing.exists()) {
      const data = existing.data()
      isActive = data.isActive ?? isActive
      isVerified = data.isVerified || isVerified
      roleToSet = data.role || roleToSet
      requestedRole = data.requestedRole ?? requestedRole
    }
  } catch (error) {
    logError('firestore', 'ensure-user-read-failed', error, { userId: user.uid })
  }
  try {
    await setDoc(
      ref,
      {
        email: user.email,
        name: user.displayName,
        role: roleToSet,
        createdAt: serverTimestamp(),
        isActive,
        isVerified,
        requestedRole,
        ...extra,
      },
      { merge: true },
    )
    logEvent('info', 'firestore', 'ensure-user', { userId: user.uid, role })
  } catch (error) {
    logError('firestore', 'ensure-user-failed', error, { userId: user.uid })
  }
}

export const updateUserRole = async (uid, role) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      role,
      requestedRole: null,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'users', 'role-updated', { userId: uid, role })
  } catch (error) {
    logError('users', 'role-update-failed', error, { userId: uid, role })
    throw error
  }
}

export const getProduct = async (id) => {
  try {
    const snap = await getDoc(doc(db, 'products', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (error) {
    logError('products', 'get-failed', error, { id })
    throw error
  }
}

const adminSettingsRef = doc(db, 'settings', 'admin')

export const getAdminSecret = async () => {
  try {
    const snap = await getDoc(adminSettingsRef)
    if (snap.exists()) {
      return snap.data()?.adminSecret || 'Arbab@321'
    }
    await setDoc(adminSettingsRef, { adminSecret: 'Arbab@321', updatedAt: serverTimestamp() })
    return 'Arbab@321'
  } catch (error) {
    logError('settings', 'get-admin-secret-failed', error)
    throw error
  }
}

export const updateAdminSecret = async (secret) => {
  try {
    await setDoc(
      adminSettingsRef,
      { adminSecret: secret, updatedAt: serverTimestamp() },
      { merge: true },
    )
    logEvent('info', 'settings', 'admin-secret-updated')
  } catch (error) {
    logError('settings', 'admin-secret-update-failed', error)
    throw error
  }
}

export const getUserProfile = async (uid) => {
  const ref = doc(db, 'users', uid)
  try {
    const snap = await getDoc(ref)
    logEvent('debug', 'firestore', 'get-user-profile', { userId: uid })
    return snap.data()
  } catch (error) {
    logError('firestore', 'get-user-profile-failed', error, { userId: uid })
    throw error
  }
}

export const updateUserProfile = async (uid, data) => {
  const ref = doc(db, 'users', uid)
  try {
    await setDoc(
      ref,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    logEvent('info', 'firestore', 'update-user-profile', { userId: uid })
  } catch (error) {
    logError('firestore', 'update-user-profile-failed', error, {
      userId: uid,
    })
    throw error
  }
}

export const requestSellerRole = async (uid) => {
  const ref = doc(db, 'users', uid)
  try {
    await updateDoc(ref, {
      requestedRole: 'seller',
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'firestore', 'request-seller', { userId: uid })
  } catch (error) {
    logError('firestore', 'request-seller-failed', error, { userId: uid })
    throw error
  }
}

export const approveSellerRole = async (uid) => {
  const ref = doc(db, 'users', uid)
  try {
    await updateDoc(ref, {
      role: 'seller',
      requestedRole: null,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'firestore', 'approve-seller', { userId: uid })
  } catch (error) {
    logError('firestore', 'approve-seller-failed', error, { userId: uid })
    throw error
  }
}

export const listSellerRequests = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('requestedRole', '==', 'seller'),
      orderBy('createdAt', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    logError('firestore', 'list-seller-requests-failed', error)
    throw error
  }
}

export const listAllUsers = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    logError('firestore', 'list-users-failed', error)
    throw error
  }
}

export const deleteUserDoc = async (uid) => {
  try {
    await deleteDoc(doc(db, 'users', uid))
    logEvent('info', 'users', 'deleted', { userId: uid })
  } catch (error) {
    logError('users', 'delete-failed', error, { userId: uid })
    throw error
  }
}

export const createProduct = async (product) => {
  try {
    const ref = await addDoc(collection(db, 'products'), {
      ...product,
      isActive: product.isActive ?? false,
      rating: product.rating ?? 0,
      ratingTotal: product.ratingTotal ?? 0,
      ratingCount: product.ratingCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'products', 'created', { id: ref.id, sellerId: product.sellerId })
    return ref.id
  } catch (error) {
    logError('products', 'create-failed', error, { sellerId: product.sellerId })
    throw error
  }
}

export const updateProduct = async (id, data) => {
  try {
    await updateDoc(doc(db, 'products', id), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'products', 'updated', { id })
  } catch (error) {
    logError('products', 'update-failed', error, { id })
    throw error
  }
}

export const addProductRating = async (productId, rating) => {
  try {
    const ref = doc(db, 'products', productId)
    const snap = await getDoc(ref)
    const existing = snap.data() || {}
    const newTotal = (existing.ratingTotal || 0) + rating
    const newCount = (existing.ratingCount || 0) + 1
    const newAverage = Number((newTotal / newCount).toFixed(1))

    await updateDoc(ref, {
      ratingTotal: increment(rating),
      ratingCount: increment(1),
      rating: newAverage,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'products', 'rated', { productId, rating })
  } catch (error) {
    logError('products', 'rating-failed', error, { productId })
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id))
    logEvent('info', 'products', 'deleted', { id })
  } catch (error) {
    logError('products', 'delete-failed', error, { id })
    throw error
  }
}

export const listProducts = async () => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    const items = snap.docs.map((d) => {
      const data = d.data()
      const ratingTotal = Number(data.ratingTotal) || 0
      const ratingCount = Number(data.ratingCount) || 0
      const ratingField = Number(data.rating)
      const average =
        ratingTotal > 0 && ratingCount > 0
          ? Number((ratingTotal / ratingCount).toFixed(1))
          : null
      const ratingCalc =
        (Number.isFinite(ratingField) && ratingField > 0 ? ratingField : null) ??
        average ??
        0
      return {
        id: d.id,
        ...data,
        rating: ratingCalc,
      }
    })
    logEvent('info', 'products', 'list', { count: items.length })
    return items
  } catch (error) {
    logError('products', 'list-failed', error)
    throw error
  }
}

export const listSellerProducts = async (sellerId) => {
  try {
    const q = query(collection(db, 'products'), where('sellerId', '==', sellerId))
    const snap = await getDocs(q)
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      )
    logEvent('info', 'products', 'list-seller', { count: items.length })
    return items
  } catch (error) {
    logError('products', 'list-seller-failed', error, { sellerId })
    throw error
  }
}

export const getCart = async (userId) => {
  try {
    const ref = doc(db, 'carts', userId)
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : { items: [] }
  } catch (error) {
    logError('cart', 'get-failed', error, { userId })
    throw error
  }
}

export const addToCart = async (userId, item) => {
  const ref = doc(db, 'carts', userId)
  try {
    await setDoc(
      ref,
      {
        items: arrayUnion(item),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    logEvent('info', 'cart', 'add-item', { userId, productId: item.productId })
  } catch (error) {
    logError('cart', 'add-failed', error, { userId })
    throw error
  }
}

export const removeFromCart = async (userId, item) => {
  const ref = doc(db, 'carts', userId)
  try {
    await updateDoc(ref, {
      items: arrayRemove(item),
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'cart', 'remove-item', { userId, productId: item.productId })
  } catch (error) {
    logError('cart', 'remove-failed', error, { userId })
    throw error
  }
}

export const clearCart = async (userId) => {
  try {
    await setDoc(doc(db, 'carts', userId), { items: [], updatedAt: serverTimestamp() })
    logEvent('info', 'cart', 'cleared', { userId })
  } catch (error) {
    logError('cart', 'clear-failed', error, { userId })
    throw error
  }
}

export const updateCartItems = async (userId, items) => {
  try {
    await setDoc(
      doc(db, 'carts', userId),
      { items, updatedAt: serverTimestamp() },
      { merge: true },
    )
    logEvent('info', 'cart', 'updated', { userId, count: items.length })
  } catch (error) {
    logError('cart', 'update-items-failed', error, { userId })
    throw error
  }
}

export const createOrder = async (order) => {
  try {
    const ref = await addDoc(collection(db, 'orders'), {
      ...order,
      status: order.status || 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'orders', 'created', { id: ref.id, buyerId: order.buyerId })
    return ref.id
  } catch (error) {
    logError('orders', 'create-failed', error, { buyerId: order.buyerId })
    throw error
  }
}

export const updateOrderStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, 'orders', id), {
      status,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'orders', 'status-updated', { id, status })
  } catch (error) {
    logError('orders', 'status-update-failed', error, { id, status })
    throw error
  }
}

export const listOrdersForBuyer = async (buyerId) => {
  try {
    const q = query(collection(db, 'orders'), where('buyerId', '==', buyerId))
    const snap = await getDocs(q)
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      )
    return items
  } catch (error) {
    logError('orders', 'list-buyer-failed', error, { buyerId })
    throw error
  }
}

export const listOrdersForSeller = async (sellerId) => {
  try {
    const q = query(collection(db, 'orders'), where('sellerId', '==', sellerId))
    const snap = await getDocs(q)
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
      )
    return items
  } catch (error) {
    logError('orders', 'list-seller-failed', error, { sellerId })
    throw error
  }
}

export const updateOrderItemRating = async (orderId, productId, rating) => {
  try {
    const ref = doc(db, 'orders', orderId)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new Error('Order not found')
    const data = snap.data()
    const updatedItems = (data.items || []).map((item) =>
      item.productId === productId ? { ...item, ratingUser: rating } : item,
    )
    await updateDoc(ref, {
      items: updatedItems,
      updatedAt: serverTimestamp(),
    })
    logEvent('info', 'orders', 'item-rated', { orderId, productId, rating })
  } catch (error) {
    logError('orders', 'item-rate-update-failed', error, { orderId, productId })
    throw error
  }
}