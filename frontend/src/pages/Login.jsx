import { useState } from 'react'
import {
  Eye, EyeOff, LockKeyhole, Mail, ArrowRight,
  UsersRound, CalendarCheck, ShieldCheck
} from 'lucide-react'
import api from '../services/api'
import './Login.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
      })

      const userData = response.data
      const token = userData.token

      if (!token) {
        throw new Error('The server did not return an authentication token.')
      }

      localStorage.setItem('intellihr_token', token)

      const user = {
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      }

      localStorage.setItem('intellihr_user', JSON.stringify(user))

      if (onLogin) {
        onLogin(user)
      }
    } catch (err) {
      const status = err.response?.status

      if (status === 401 || status === 403) {
        setError('Invalid email or password. Please try again.')
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check that the backend is running.')
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="showcase-content">
          <div className="login-brand">
            <div className="login-brand-icon">i</div>
            <div>
              <h1>IntelliHR</h1>
              <p>PEOPLE MANAGEMENT</p>
            </div>
          </div>

          <div className="showcase-message">
            <span className="showcase-eyebrow">INTELLIGENT HR MANAGEMENT</span>
            <h2>Empowering people.<br />Simplifying work.</h2>
            <p>
              A unified workspace to manage your workforce,
              streamline recruitment, and bring your HR operations together.
            </p>
          </div>

          <div className="showcase-features">
            <div className="showcase-feature">
              <div className="showcase-feature-icon">
                <UsersRound size={19} />
              </div>
              <div>
                <strong>People management</strong>
                <span>Manage your workforce in one place</span>
              </div>
            </div>

            <div className="showcase-feature">
              <div className="showcase-feature-icon">
                <CalendarCheck size={19} />
              </div>
              <div>
                <strong>Recruitment workspace</strong>
                <span>Organize hiring and interview workflows</span>
              </div>
            </div>

            <div className="showcase-feature">
              <div className="showcase-feature-icon">
                <ShieldCheck size={19} />
              </div>
              <div>
                <strong>Secure access</strong>
                <span>Role-based access to your HR workspace</span>
              </div>
            </div>
          </div>
        </div>

        <div className="showcase-bottom">
          <span>SMARTER HR. BETTER WORKPLACE.</span>
          <span>Â© 2026 IntelliHR</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-content">
          <div className="login-mobile-brand">
            <div className="login-brand-icon">i</div>
            <span>IntelliHR</span>
          </div>

          <div className="login-card">
            <div className="login-heading">
              <span className="login-eyebrow">WELCOME BACK</span>
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to access your workspace.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="login-label" htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <label className="login-label password-label" htmlFor="password">
                Password
              </label>

              <div className="login-input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in to IntelliHR'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-security">
              <LockKeyhole size={15} />
              <span>Your connection is secured with JWT authentication.</span>
            </div>
          </div>

          <p className="login-footer">
            Secure access to your IntelliHR workspace.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login

