import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LuMail, LuSend } from 'react-icons/lu'
import PrimaryButton from '../../components/common/PrimaryButton'
import TextField from '../../components/forms/TextField'
import { useAuth } from '../../context/AuthContext'
import { logEvent, logError } from '../../services/logger'

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      await resetPassword(email)
      logEvent('info', 'auth', 'password-reset-request', { email })
      setStatus({
        type: 'success',
        message: 'Password reset link sent. Check your email.',
      })
    } catch (error) {
      logError('auth', 'password-reset-ui-failed', error)
      setStatus({
        type: 'error',
        message: error?.message || 'Could not send reset link',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-3xl border border-border bg-bg-elevated/80 p-6 shadow-card md:p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
          Recover access
        </p>
        <h1 className="font-display text-3xl text-text-primary">Forgot password</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<LuMail />}
          />
          {status && (
            <p
              className={`text-sm ${status.type === 'success' ? 'text-green-600' : 'text-danger'}`}
            >
              {status.message}
            </p>
          )}
          <PrimaryButton
            type="submit"
            icon={<LuSend />}
            loading={loading}
            className="w-full justify-center"
          >
            Send reset link
          </PrimaryButton>
        </form>

        <p className="mt-4 text-sm text-text-secondary">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-accent">
            Go back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordPage