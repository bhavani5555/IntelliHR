import { Link } from 'react-router-dom'
import { BriefcaseBusiness, LogIn, UserPlus, Search } from 'lucide-react'
import './CandidatePortal.css'
function CandidatePortal() {
  return (
    <div className="candidate-portal">
      <header className="candidate-header">
        <Link to="/careers" className="candidate-brand">
          <BriefcaseBusiness size={28} />
          <span>IntelliHR Careers</span>
        </Link>

        <nav className="candidate-nav">
          <Link to="/careers">Home</Link>
          <Link to="/careers/jobs">Browse Jobs</Link>
          <Link to="/careers/login">Sign In</Link>
          <Link to="/careers/register" className="candidate-register-link">
            Register
          </Link>
        </nav>
      </header>

      <main className="candidate-hero">
        <div className="candidate-hero-content">
          <span className="candidate-eyebrow">
            YOUR NEXT OPPORTUNITY STARTS HERE
          </span>

          <h1>
            Find a career where
            <span> your future grows.</span>
          </h1>

          <p>
            Explore opportunities, showcase your skills, and take the next
            step in your professional journey with IntelliHR.
          </p>

          <div className="candidate-hero-actions">
            <Link to="/careers/jobs" className="candidate-primary-button">
              <Search size={18} />
              Explore Jobs
            </Link>

            <Link to="/careers/register" className="candidate-secondary-button">
              <UserPlus size={18} />
              Create Account
            </Link>
          </div>

          <div className="candidate-signin-prompt">
            Already registered?
            <Link to="/careers/login">
              Sign in <LogIn size={14} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="candidate-footer">
        © 2026 IntelliHR Careers. All rights reserved.
      </footer>
    </div>
  )
}

export default CandidatePortal


