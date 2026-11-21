import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseBusiness, UserPlus } from 'lucide-react'
import candidateApi from '../../services/candidateApi'
import './CandidateAuth.css'

function CandidateRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    currentLocation: '',
    yearsOfExperience: 0,
    skills: '',
    highestQualification: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'yearsOfExperience' ? value : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (Number(form.yearsOfExperience) < 0) {
      setError('Years of experience cannot be negative.')
      return
    }

    try {
      setLoading(true)

      const requestData = {
        ...form,
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        currentLocation: form.currentLocation.trim(),
        yearsOfExperience: Number(form.yearsOfExperience),
        skills: form.skills.trim(),
        highestQualification: form.highestQualification.trim(),
      }

      await candidateApi.post('/api/candidates/register', requestData)

      navigate('/careers/login', {
        state: { email: requestData.email },
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Registration failed. Please check your details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="candidate-auth-page">
      <header className="candidate-auth-header">
        <Link to="/careers" className="candidate-brand">
          <BriefcaseBusiness size={27} />
          <span>IntelliHR Careers</span>
        </Link>

        <Link to="/careers" className="candidate-back-link">
          Back to Careers
        </Link>
      </header>

      <main className="candidate-auth-main">
        <section className="candidate-auth-card">
          <div className="candidate-auth-heading">
            <div className="candidate-auth-icon">
              <UserPlus size={25} />
            </div>
            <h1>Create your candidate account</h1>
            <p>Enter your details to explore and apply for opportunities.</p>
          </div>

          {error && (
            <div className="candidate-form-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="candidate-register-form">
            <div className="candidate-form-grid">
              <label>
                First Name *
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Last Name *
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  maxLength={100}
                  required
                />
              </label>

              <label className="candidate-full-field">
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Password *
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  maxLength={72}
                  required
                />
              </label>

              <label>
                Confirm Password *
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </label>

              <label>
                Phone Number *
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  maxLength={15}
                  required
                />
              </label>

              <label>
                Current Location
                <input
                  name="currentLocation"
                  value={form.currentLocation}
                  onChange={handleChange}
                  placeholder="City, State"
                  maxLength={150}
                />
              </label>

              <label>
                Years of Experience *
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={form.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </label>

              <label>
                Highest Qualification
                <input
                  name="highestQualification"
                  value={form.highestQualification}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech"
                  maxLength={150}
                />
              </label>

              <label className="candidate-full-field">
                Skills
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g. Java, Spring Boot, MySQL, React"
                  maxLength={3000}
                  rows={3}
                />
              </label>
            </div>

            <button
              type="submit"
              className="candidate-auth-submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="candidate-auth-switch">
            Already have an account?
            <Link to="/careers/login">Sign in</Link>
          </p>
        </section>
      </main>
    </div>
  )
}

export default CandidateRegister