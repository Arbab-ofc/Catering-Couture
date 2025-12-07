const STORAGE_KEY = 'guest_cart'

export const getGuestCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export const setGuestCart = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    /* ignore */
  }
}

export const addGuestItem = (item) => {
  const items = getGuestCart()
  const existingIndex = items.findIndex((i) => i.productId === item.productId)
  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      qty: (items[existingIndex].qty || 1) + (item.qty || 1),
    }
  } else {
    items.push({ ...item, qty: item.qty || 1 })
  }
  setGuestCart(items)
  return items
}

export const updateGuestItems = (items) => setGuestCart(items)
export const clearGuestCart = () => setGuestCart([])
