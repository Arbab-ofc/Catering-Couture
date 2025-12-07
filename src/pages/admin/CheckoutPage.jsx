import { useEffect, useMemo, useState } from 'react'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { logEvent, logError } from '../../services/logger'
import {
  clearCart,
  createOrder,
  getCart,
} from '../../services/firebase/firestore'
import { useAuth } from '../../context/AuthContext'

const CheckoutPage = () => {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: '',
    postal: '',
    instructions: '',
    payment: 'card',
  })
  const [cart, setCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    logEvent('info', 'checkout', 'viewed')
    const loadCart = async () => {
      if (!user?.uid) return
      try {
        const data = await getCart(user.uid)
        setCart(data.items || [])
      } catch (error) {
        logError('checkout', 'load-cart-failed', error)
      }
    }
    loadCart()
  }, [user])

  useEffect(() => {
    if (profile?.address) {
      setForm((prev) => ({ ...prev, address: profile.address }))
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 1), 0),
    [cart],
  )
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + tax

  const handleOrder = async () => {
    if (!user?.uid) return
    if (cart.length === 0) return
    setStatus(null)
    setSubmitting(true)
    try {
      const orderId = await createOrder({
        buyerId: user.uid,
        sellerId: cart[0]?.sellerId || 'unknown',
        sellerName: cart[0]?.sellerName || cart[0]?.seller || 'Unknown seller',
        buyerName: user.displayName || user.email,
        items: cart,
        totalAmount: total,
        deliveryAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          postal: form.postal,
        },
        specialInstructions: form.instructions,
        paymentMethod: form.payment,
        status: 'Pending',
        createdAt: new Date(),
      })
      await clearCart(user.uid)
      logEvent('info', 'checkout', 'order-created', { total, orderId })
      setStatus({ type: 'success', message: 'Order placed successfully' })
    } catch (error) {
      logError('checkout', 'order-failed', error)
      setStatus({ type: 'error', message: 'Order failed. Try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Finalize
        </p>
        <h1 className="font-display text-3xl text-text-primary">
          Delivery & payment
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">
            Delivery address
          </h2>
          <TextField
            label="Street address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
            <TextField
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              required
            />
          </div>
          <TextField
            label="Postal code"
            name="postal"
            value={form.postal}
            onChange={handleChange}
            required
          />
          <label className="block">
            <span className="text-sm text-text-secondary">Special instructions</span>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary shadow-inner outline-none focus:border-accent focus:shadow-glow"
            ></textarea>
          </label>

          <div>
            <p className="text-sm font-semibold text-text-primary">Payment</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {['card', 'upi', 'cash'].map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${form.payment === method ? 'border-accent bg-accent/10 text-text-primary' : 'border-border bg-bg-base/70'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={form.payment === method}
                    onChange={handleChange}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="capitalize">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">
            Order summary
          </h2>
          <div className="mt-4 space-y-2 text-sm text-text-secondary">
            {cart.length === 0 && <p>No items in cart.</p>}
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {item.name} x{item.qty || 1}
                </span>
                <span>₹{(item.price || 0) * (item.qty || 1)}</span>
              </div>
            ))}
            <div className="flex justify-between text-text-primary">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-semibold">₹{total}</span>
            </div>
          </div>
          <PrimaryButton
            className="mt-4 w-full justify-center"
            onClick={handleOrder}
            loading={submitting}
            disabled={cart.length === 0}
          >
            {cart.length === 0 ? 'Cart is empty' : 'Confirm order'}
          </PrimaryButton>
          {status && (
            <p
              className={`mt-2 text-sm ${status.type === 'success' ? 'text-green-600' : 'text-danger'}`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
