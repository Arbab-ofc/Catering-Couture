import { useEffect, useState } from 'react'
import { LuBuilding2, LuClock3, LuMapPin } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { logEvent, logError } from '../../services/logger'
import { useAuth } from '../../context/AuthContext'

const SellerProfilePage = () => {
  const { profile, updateProfile, user } = useAuth()
  const [form, setForm] = useState({
    businessName: profile?.businessName || 'Coastal Bloom Catering',
    description:
      profile?.description ||
      'Coastal-inspired catering with live seafood counters and artisanal desserts.',
    hours: profile?.hours || '09:00 - 22:00',
    serviceAreas: profile?.serviceAreas || 'Goa, Pune, Mumbai',
    contact: profile?.contact || user?.phoneNumber || '',
    bank: profile?.bank || '****1234 (display only)',
  })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    logEvent('info', 'seller-profile', 'viewed')
  }, [])

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      businessName: profile?.businessName || prev.businessName,
      description: profile?.description || prev.description,
      hours: profile?.hours || prev.hours,
      serviceAreas: profile?.serviceAreas || prev.serviceAreas,
      contact: profile?.contact || prev.contact,
      bank: profile?.bank || prev.bank,
    }))
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    try {
      await updateProfile(form)
      setStatus({ type: 'success', message: 'Profile saved' })
    } catch (error) {
      logError('seller-profile', 'save-failed', error)
      setStatus({ type: 'error', message: 'Could not save' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Seller profile
        </p>
        <h1 className="font-display text-3xl text-text-primary">
          Business identity
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-text-primary">
              {(form.businessName || 'S')[0]}
              {(form.businessName || 'C')[1] || ''}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">
                {form.businessName}
              </p>
              <p className="text-sm text-text-secondary">{form.serviceAreas}</p>
            </div>
          </div>
          <div className="space-y-2 rounded-2xl border border-border bg-bg-base/80 p-4">
            <p className="text-sm font-semibold text-text-primary">
              Profile completion
            </p>
            <div className="h-2 rounded-full bg-border">
              <div className="h-full w-2/3 rounded-full bg-accent"></div>
            </div>
            <p className="text-xs text-text-secondary">67% complete</p>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card">
          <h2 className="text-lg font-semibold text-text-primary">Business info</h2>
          <TextField
            label="Business name"
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
          />
          <label className="block">
            <span className="text-sm text-text-secondary">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="mt-2 w-full rounded-xl border border-border bg-bg-base px-3 py-2 text-sm text-text-primary shadow-inner outline-none focus:border-accent focus:shadow-glow"
            ></textarea>
          </label>
          <TextField
            label="Service areas"
            name="serviceAreas"
            value={form.serviceAreas}
            onChange={handleChange}
            icon={<LuMapPin />}
          />
          <TextField
            label="Operating hours"
            name="hours"
            value={form.hours}
            onChange={handleChange}
            icon={<LuClock3 />}
          />
          <TextField
            label="Contact number"
            name="contact"
            value={form.contact}
            onChange={handleChange}
          />
          <TextField
            label="Bank / payment details (display)"
            name="bank"
            value={form.bank}
            onChange={handleChange}
            icon={<LuBuilding2 />}
          />
          {status && (
            <p
              className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-danger'}`}
            >
              {status.message}
            </p>
          )}
          <PrimaryButton className="w-full justify-center" onClick={saveProfile}>
            Save profile
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default SellerProfilePage