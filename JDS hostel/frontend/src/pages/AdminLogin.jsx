import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { storeSession } from '../services/auth'

function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.email || !form.password) {
      setError('Enter your email and password to continue.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { data } = await api.post('/auth/admin/login', form)
      storeSession(data.token, data.admin)
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual__pattern" />
        <div className="login-visual__content">
          <div className="brand-lockup"><span className="brand-mark brand-mark--large">J</span><span>JDS Hostel</span></div>
          <div className="login-visual__headline">
            <p className="eyebrow eyebrow--light">Administration portal</p>
            <h1>Keep every stay running smoothly.</h1>
            <p>One calm workspace for your residents, rooms, and daily operations.</p>
          </div>
          <div className="login-visual__footer"><ShieldCheck size={16} /> Secure access for authorised administrators</div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel__inner">
          <div className="login-panel__mobile-brand"><span className="brand-mark">J</span><strong>JDS Hostel</strong></div>
          <div className="login-heading">
            <span className="login-heading__icon"><LockKeyhole size={19} /></span>
            <p className="eyebrow">Welcome back</p>
            <h2>Sign in to your workspace</h2>
            <p>Use your administrator account to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="form-error" role="alert">{error}</div>}
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Mail size={17} />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@jds-hostel.com" value={form.email} onChange={updateField} />
            </div>
            <div className="form-label-row"><label htmlFor="password">Password</label><button type="button" className="text-button" onClick={() => setError('Password reset is available from Settings → Change password after signing in.')}>Forgot password?</button></div>
            <div className="input-wrap">
              <LockKeyhole size={17} />
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={updateField} />
              <button type="button" className="input-action" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            <label className="checkbox-label"><input type="checkbox" /> <span>Keep me signed in</span></label>
            <button className="primary-button primary-button--full" type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}<span>↗</span></button>
          </form>
          <p className="login-panel__note">Need access? Contact your hostel administrator.</p>
        </div>
      </section>
    </main>
  )
}

export default AdminLogin