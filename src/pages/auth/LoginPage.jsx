import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LuLogIn, LuMail, LuLock, LuShieldCheck, LuTriangleAlert } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { logEvent } from '../../services/logger'

const LoginPage = () => {
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    logEvent('info', 'login', 'viewed')
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await login({ email: form.email, password: form.password })
      setStatus({ type: 'success', message: 'Logged in successfully' })
      logEvent('info', 'login', 'submit-success', { email: form.email })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Login failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await loginGoogle()
      setStatus({ type: 'success', message: 'Google login successful' })
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || 'Google login failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card md:p-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Welcome back
            </p>
            <h1 className="font-display text-3xl text-text-primary">Login</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-bg-base/70 px-4 py-2 text-xs uppercase tracking-[0.18em] text-text-secondary md:flex">
            <LuShieldCheck className="text-accent" /> Secure access
          </div>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              Remember me
            </label>
            <Link to="/forgot" className="text-accent">
              Forgot password?
            </Link>
          </div>

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
            icon={<LuLogIn />}
          >
            Login
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
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
