import { useEffect, useState } from 'react'
import { LuLock } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { logEvent, logError } from '../../services/logger'
import { useAuth } from '../../context/AuthContext'
import { listOrdersForBuyer } from '../../services/firebase/firestore'
import { requestSellerRole } from '../../services/firebase/firestore'

const ProfilePage = () => {
  const { profile, updateProfile, user, sendVerification, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: profile?.name || user?.displayName || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  })
  const [status, setStatus] = useState(null)
  const [stats, setStats] = useState({ orders: 0, reorders: 0 })

  useEffect(() => {
    logEvent('info', 'profile', 'viewed-admin')
  }, [])

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: profile?.name || user?.displayName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    }))
  }, [profile, user])

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.uid) return
      try {
        const orders = await listOrdersForBuyer(user.uid)
        const total = orders.length
        const uniqueSellers = new Set(
          orders.map((o) => o.sellerId || o.seller || o.sellerName || o.id),
        ).size
        const reorders = Math.max(0, total - uniqueSellers)
        setStats({ orders: total, reorders })
      } catch (error) {
        logError('profile', 'load-orders-failed', error)
      }
    }
    loadOrders()
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      await updateProfile(form)
      setStatus({ type: 'success', message: 'Profile updated' })
    } catch (error) {
      logError('profile', 'update-failed', error)
      setStatus({
        type: 'error',
        message: error?.message || 'Update failed. Please try again.',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Account
        </p>
        <h1 className="font-display text-3xl text-text-primary">My profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-text-primary">
              {(form.name || 'C')[0]}
              {(form.name || 'G')[1] || ''}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {form.name}
              </p>
              <p className="text-sm text-text-secondary">{form.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-text-secondary">
            <div>
              <p className="text-xs uppercase tracking-[0.12em]">Orders</p>
              <p className="text-xl font-semibold text-text-primary">
                {stats.orders}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em]">Reorders</p>
              <p className="text-xl font-semibold text-text-primary">
                {stats.reorders}
              </p>
            </div>
          </div>
          <PrimaryButton variant="outline">Upload new avatar</PrimaryButton>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Details</h2>
            {user?.email && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {user.emailVerified ? 'Email verified' : 'Email not verified'}
              </span>
            )}
          </div>
          <TextField
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
          {status && (
            <p
              className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-danger'}`}
            >
              {status.message}
            </p>
          )}
          <PrimaryButton className="w-full justify-center" onClick={saveProfile}>
            Save changes
          </PrimaryButton>
          {!user?.emailVerified && (
            <PrimaryButton
              variant="outline"
              className="w-full justify-center"
              onClick={async () => {
                try {
                  await sendVerification()
                  await refreshUser()
                  setStatus({ type: 'success', message: 'Verification email sent' })
                } catch (error) {
                  setStatus({ type: 'error', message: error?.message || 'Failed to send email' })
                }
              }}
            >
              Send verification email
            </PrimaryButton>
          )}

          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-bg-base/80 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <LuLock /> Security
            </h3>
            <PrimaryButton variant="outline" icon={<LuLock />} className="w-full justify-center">
              Change password
            </PrimaryButton>
            <div className="h-px bg-border/60"></div>
            <button className="mt-2 text-left text-sm text-danger hover:underline">
              Delete account
            </button>
          </div>
          {profile?.role !== 'seller' && (
            <PrimaryButton
              variant="outline"
              className="w-full justify-center"
              onClick={async () => {
                try {
                  await requestSellerRole(user.uid)
                  setStatus({ type: 'success', message: 'Seller request submitted' })
                } catch (error) {
                  setStatus({ type: 'error', message: 'Could not submit request' })
                }
              }}
            >
              Become a seller
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage