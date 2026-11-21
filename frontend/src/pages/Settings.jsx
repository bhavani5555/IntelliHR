import { useState } from 'react'
import {
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  BellRing,
  Palette,
  KeyRound
} from 'lucide-react'
import api from '../services/api'
import './Settings.css'

function SettingsPage({ user, theme, setTheme }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const role = user?.role?.replace('ROLE_', '').toUpperCase() || 'EMPLOYEE'
  const displayName = user?.username || user?.name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || 'Email not available'
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setMessage(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must contain at least 8 characters.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirm password do not match.' })
      return
    }

    if (newPassword === currentPassword) {
      setMessage({ type: 'error', text: 'New password must be different from your current password.' })
      return
    }

    try {
      setLoading(true)

      await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword
      })

      setMessage({ type: 'success', text: 'Your password has been changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to change password. Please check your current password and try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-welcome">
        <div>
          <span className="settings-eyebrow">PREFERENCES & ACCOUNT</span>
          <h1>Settings</h1>
          <p>Manage your account details, security and application preferences.</p>
        </div>
        <div className="settings-welcome-icon">
          <ShieldCheck size={27} />
        </div>
      </div>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <UserRound size={19} />
          </div>
          <div>
            <h2>Account Information</h2>
            <p>Your IntelliHR account details and access level.</p>
          </div>
        </div>

        <div className="settings-account-card">
          <div className="settings-account-avatar">{initials || 'U'}</div>

          <div className="settings-account-details">
            <h3>{displayName}</h3>
            <p>{email}</p>
            <div className="settings-account-badges">
              <span className="settings-role">{role}</span>
              <span className="settings-verified">
                <ShieldCheck size={13} />
                Account
              </span>
            </div>
          </div>

          <div className="settings-account-status">
            <span className="settings-status-dot" />
            Account Active
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <Palette size={19} />
          </div>
          <div>
            <h2>Appearance</h2>
            <p>Choose how IntelliHR looks on your device.</p>
          </div>
        </div>

        <div className="settings-preference-card">
          <div className="settings-preference-intro">
            <div className="settings-preference-symbol">
              <Sun size={20} />
            </div>
            <div>
              <h3>Display Theme</h3>
              <p>Select your preferred application appearance.</p>
            </div>
          </div>

          <div className="settings-theme-options">
            <button
              type="button"
              className={`settings-theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
            >
              <Sun size={21} />
              <span>Light Mode</span>
              {theme === 'light' && <CheckCircle2 size={17} className="settings-theme-check" />}
            </button>

            <button
              type="button"
              className={`settings-theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              <Moon size={21} />
              <span>Dark Mode</span>
              {theme === 'dark' && <CheckCircle2 size={17} className="settings-theme-check" />}
            </button>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <BellRing size={19} />
          </div>
          <div>
            <h2>Notifications</h2>
            <p>Stay informed about important updates in IntelliHR.</p>
          </div>
        </div>

        <div className="settings-preference-card settings-notification-card">
          <div className="settings-preference-intro">
            <div className="settings-preference-symbol">
              <BellRing size={20} />
            </div>
            <div>
              <h3>In-app Notifications</h3>
              <p>View your updates and alerts from the notification bell in the application header.</p>
            </div>
          </div>
          <span className="settings-notification-status">Available</span>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div className="settings-heading-icon">
            <LockKeyhole size={19} />
          </div>
          <div>
            <h2>Security</h2>
            <p>Keep your account secure by updating your password.</p>
          </div>
        </div>

        <div className="settings-password-card">
          <div className="settings-password-card-heading">
            <div className="settings-password-title-icon">
              <KeyRound size={19} />
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Choose a strong password that you do not use elsewhere.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="settings-password-fields">
              <div className="settings-field">
                <label htmlFor="currentPassword">Current Password</label>
                <div className="settings-password-input">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={event => setCurrentPassword(event.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(value => !value)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="newPassword">New Password</label>
                <div className="settings-password-input">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={event => setNewPassword(event.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(value => !value)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="settings-password-hint">Minimum 8 characters.</span>
              </div>

              <div className="settings-field">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="settings-password-input">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(value => !value)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className={`settings-message ${message.type}`} role="alert">
                {message.type === 'success'
                  ? <CheckCircle2 size={17} />
                  : <AlertCircle size={17} />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="settings-form-footer">
              <p>Password changes take effect immediately.</p>
              <button type="submit" className="settings-save-button" disabled={loading}>
                <LockKeyhole size={16} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="settings-footer">
        <ShieldCheck size={15} />
        <span>Your account security and preferences are managed securely by IntelliHR.</span>
      </div>
    </div>
  )
}

export default SettingsPage