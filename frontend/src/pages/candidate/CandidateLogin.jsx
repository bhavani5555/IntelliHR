import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  Target,
  TrendingUp,
} from 'lucide-react'
import candidateApi from '../../services/candidateApi'
import './CandidateAuth.css'

function CandidateLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(location.state?.email || '')
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

      const response = await candidateApi.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      })

      const userData = response.data

      if (!userData.token) {
        throw new Error('Authentication token was not returned.')
      }

      if (String(userData.role).toUpperCase() !== 'CANDIDATE') {
        setError('This login is only for candidates. Please use the IntelliHR login for staff accounts.')
        return
      }

      localStorage.removeItem('intellihr_token')
      localStorage.removeItem('intellihr_user')

      localStorage.setItem('candidate_token', userData.token)
      localStorage.setItem('candidate_user', JSON.stringify({
        userId: userData.userId,
        username: userData.username,
        email: userData.email,
        role: userData.role,
      }))

      navigate('/careers/dashboard', { replace: true })
    } catch (err) {
      const status = err.response?.status

      if (status === 401 || status === 403) {
        setError('Invalid email or password. Please try again.')
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check that the backend is running.')
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="candidate-auth-page candidate-login-page">
      <div className="candidate-login-layout">

        <section className="candidate-login-intro">
          <Link to="/careers" className="candidate-login-logo">
            <span className="candidate-login-logo-icon">
              <BriefcaseBusiness size={25} />
            </span>
            <span>IntelliHR <strong>Careers</strong></span>
          </Link>

          <div className="candidate-login-intro-content">
            <span className="candidate-login-tag">YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Find work that moves your career forward.</h1>
            <p>
              Discover opportunities, connect with employers, and keep your
              job applications organized in one place.
            </p>

            <div className="candidate-login-benefits">
              <div>
                <span><Target size={20} /></span>
                <div>
                  <strong>Explore opportunities</strong>
                  <small>Discover jobs that match your skills.</small>
                </div>
              </div>

              <div>
                <span><TrendingUp size={20} /></span>
                <div>
                  <strong>Track your progress</strong>
                  <small>Follow your applications in one place.</small>
                </div>
              </div>

              <div>
                <span><Users size={20} /></span>
                <div>
                  <strong>Build your profile</strong>
                  <small>Keep your professional details updated.</small>
                </div>
              </div>
            </div>
          </div>

          <p className="candidate-login-footer">
            © {new Date().getFullYear()} IntelliHR Careers
          </p>
        </section>

        <section className="candidate-login-form-panel">
          <div className="candidate-auth-card candidate-login-card">
            <div className="candidate-login-mobile-brand">
              <BriefcaseBusiness size={25} />
              <span>IntelliHR Careers</span>
            </div>

            <div className="candidate-auth-heading">
              <span className="candidate-auth-eyebrow">CANDIDATE PORTAL</span>
              <h1>Welcome back</h1>
              <p>Sign in to continue your job search.</p>
            </div>

            <form onSubmit={handleSubmit} className="candidate-auth-form">
              <div className="candidate-login-field">
                <label htmlFor="candidate-email">Email address</label>
                <div className="candidate-auth-input">
                  <Mail size={19} />
                  <input
                    id="candidate-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="candidate-login-field">
                <label htmlFor="candidate-password">Password</label>
                <div className="candidate-auth-input">
                  <LockKeyhole size={19} />
                  <input
                    id="candidate-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="candidate-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="candidate-auth-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="candidate-auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="candidate-auth-switch">
              <span>Don't have an account?</span>
              <Link to="/careers/register">Create an account</Link>
            </div>

            <Link to="/careers" className="candidate-auth-back">
              Back to Careers Home
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}

export default CandidateLogin