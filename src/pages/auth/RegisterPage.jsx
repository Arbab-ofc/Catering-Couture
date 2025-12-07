import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LuUserPlus,
  LuMail,
  LuLock,
  LuPhone,
  LuShield,
  LuTriangleAlert,
} from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { logEvent } from '../../services/logger'

const RegisterPage = () => {
  const { register, loginGoogle } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    role: 'user',
    adminSecret: '',
    terms: false,
  })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    logEvent('info', 'register', 'viewed')
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    if (!form.terms) {
      setStatus({ type: 'error', message: 'Please accept the terms' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      await register({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        role: form.role,
        adminSecret: form.adminSecret,
      })
      setStatus({ type: 'success', message: 'Registration successful' })
      logEvent('info', 'register', 'submit-success', { email: form.email, role: form.role })
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginGoogle()
      setStatus({ type: 'success', message: 'Google sign-in successful' })
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Google sign-in failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card md:p-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Join the marketplace
            </p>
            <h1 className="font-display text-3xl text-text-primary">
              Register as Admin or Seller
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-base/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-secondary">
            <LuShield className="text-accent" /> Verified marketplace
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Full name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <TextField
              label="Confirm password"
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
            <TextField
              label="Phone number"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {['admin', 'user'].map((role) => (
              <label
                key={role}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${form.role === role ? 'border-accent bg-accent/10 text-text-primary' : 'border-border bg-bg-base/70'}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={form.role === role}
                  onChange={handleChange}
                  className="h-4 w-4 accent-accent"
                />
                <div>
                  <p className="font-semibold capitalize">{role}</p>
                  <p className="text-xs text-text-secondary">
                    {role === 'admin'
                      ? 'Browse and order catering experiences'
                      : 'Upload and manage your catering menus'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {form.role === 'admin' && (
            <TextField
              label="Admin secret code"
              name="adminSecret"
              type="password"
              value={form.adminSecret}
              onChange={handleChange}
              required
            />
          )}

          <label className="flex items-start gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            I agree to the terms and conditions and understand that all activity
            is logged for quality and support.
          </label>

          {status && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-green-400 text-green-600'
                  : 'border-red-400 text-red-500'
              }`}
            >
              <LuTriangleAlert />
              {status.message}
            </div>
          )}

          <PrimaryButton
            type="submit"
            loading={loading}
            className="w-full justify-center"
            icon={<LuUserPlus />}
          >
            Register
          </PrimaryButton>
          <PrimaryButton
            type="button"
            variant="outline"
            onClick={handleGoogle}
            loading={loading}
            className="w-full justify-center"
          >
            Continue with Google
          </PrimaryButton>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage