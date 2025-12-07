import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuTrash2, LuPlus, LuMinus, LuShoppingCart } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import LazyImage from '../../components/common/LazyImage'
import { logEvent, logError } from '../../services/logger'
import { clearCart, getCart, updateCartItems } from '../../services/firebase/firestore'
import { useAuth } from '../../context/AuthContext'
import {
  getGuestCart,
  updateGuestItems,
  clearGuestCart,
} from '../../services/localCart'

const CartPage = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const syncBadge = (list) => {
    const count = (list || []).reduce((sum, i) => sum + (i.qty || 1), 0)
    window.dispatchEvent(
      new CustomEvent('cart-count-changed', {
        detail: { absolute: count },
      }),
    )
  }

  useEffect(() => {
    logEvent('info', 'cart', 'viewed')
    const load = async () => {
      setLoading(true)
      try {
          if (!user?.uid) {
            setItems(getGuestCart())
            syncBadge(getGuestCart())
          } else {
            const guest = getGuestCart()
            const data = await getCart(user.uid)
            const remoteItems = data.items || []
            if (!remoteItems.length && guest.length) {
              await updateCartItems(user.uid, guest)
              setItems(guest)
              clearGuestCart()
              syncBadge(guest)
            } else {
              setItems(remoteItems)
              syncBadge(remoteItems)
            }
          }
        } catch (error) {
          logError('cart', 'load-failed', error)
        } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const navigate = useNavigate()

  const updateQuantity = async (index, delta) => {
    const newItems = [...items]
    const nextQty = Math.max(1, (newItems[index].qty || 1) + delta)
    newItems[index] = { ...newItems[index], qty: nextQty }
    setItems(newItems)
    syncBadge(newItems)
    if (!user?.uid) {
      updateGuestItems(newItems)
      return
    }
    try {
      await updateCartItems(user.uid, newItems)
    } catch (error) {
      logError('cart', 'update-qty-failed', error)
    }
  }

  const removeItem = async (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    syncBadge(newItems)
    if (!user?.uid) {
      updateGuestItems(newItems)
      return
    }
    try {
      await updateCartItems(user.uid, newItems)
    } catch (error) {
      logError('cart', 'remove-failed', error)
    }
  }

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0),
    [items],
  )
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Your cart
        </p>
        <h1 className="font-display text-3xl text-text-primary">Curated order</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {loading && <p className="text-text-secondary">Loading cart...</p>}
          {!loading && items.length === 0 && (
              <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-elevated/80 via-bg-base/70 to-bg-elevated/60 p-8 text-center shadow-card">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,128,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_30%)]" />
                <div className="relative space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/40 bg-gradient-to-br from-accent/25 via-accent/20 to-accent/10 text-accent shadow-inner">
                    <LuShoppingCart size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-text-primary">Your cart is empty</h3>
                  <p className="text-sm text-text-secondary">
                    Discover chef-led menus, add experiences, and return here to confirm.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <PrimaryButton onClick={() => navigate('/products')} className="justify-center">
                    Browse menus
                  </PrimaryButton>
                  <PrimaryButton
                    variant="outline"
                    onClick={() => navigate('/home')}
                    className="justify-center"
                  >
                    Go home
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}
          {items.map((item, idx) => (
            <div
              key={`${item.productId}-${idx}`}
              className="flex gap-4 rounded-2xl border border-border bg-bg-elevated/80 p-4 shadow-subtle"
            >
              <LazyImage
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-xl object-cover"
                placeholderClassName="h-24 w-24 rounded-xl"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-text-primary">
                  {item.name}
                </p>
                <p className="text-sm text-text-secondary">Serves 20 guests</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    className="rounded-full border border-border p-2 hover:border-accent"
                    onClick={() => updateQuantity(idx, -1)}
                  >
                    <LuMinus />
                  </button>
                  <span className="text-sm">{item.qty}</span>
                  <button
                    className="rounded-full border border-border p-2 hover:border-accent"
                    onClick={() => updateQuantity(idx, 1)}
                  >
                    <LuPlus />
                  </button>
                  <button
                    className="ml-auto rounded-full border border-border p-2 hover:border-danger hover:text-danger"
                    onClick={() => removeItem(idx)}
                  >
                    <LuTrash2 />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Price</p>
                <p className="text-xl font-semibold text-text-primary">
                  ₹{(item.price || 0) * (item.qty || 1)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-bg-elevated/80 p-5 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">Summary</h2>
          <div className="mt-4 space-y-2 text-sm text-text-secondary">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax}</span>
            </div>
            <div className="flex justify-between text-text-primary">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-semibold">₹{total}</span>
            </div>
          </div>
          <PrimaryButton
            className="mt-4 w-full justify-center"
            onClick={() => (user ? navigate('/checkout') : navigate('/login'))}
            disabled={items.length === 0}
          >
            {items.length === 0
              ? 'Cart is empty'
              : user
                ? 'Proceed to checkout'
                : 'Login to checkout'}
          </PrimaryButton>
          <PrimaryButton
            variant="outline"
            className="mt-3 w-full justify-center"
            onClick={() => (window.location.href = '/orders')}
          >
            View my orders
          </PrimaryButton>
          <button
            className="mt-3 w-full rounded-xl border border-border px-4 py-3 text-sm text-text-secondary hover:border-danger hover:text-danger"
            onClick={async () => {
              setItems([])
              syncBadge([])
              if (user?.uid) {
                await clearCart(user.uid)
              } else {
                clearGuestCart()
              }
            }}
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default CartPage