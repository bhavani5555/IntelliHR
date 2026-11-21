import { useEffect, useState } from 'react'
import {
  UserRound,
  Mail,
  CalendarDays,
  Phone,
  MapPin,
  Pencil,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  BadgeCheck
} from 'lucide-react'
import api from '../services/api'
import './Profile.css'

const initialForm = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  dateOfBirth: '',
  address: '',
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Profile({ user }) {
  const role = user?.role?.replace('ROLE_', '').toUpperCase() || 'EMPLOYEE'
  const isEmployee = role === 'EMPLOYEE'

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(isEmployee)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProfile = async () => {
    if (!isEmployee) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await api.get('/api/employees/me/profile')
      const data = response.data

      setProfile(data)
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
    })

    setEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      setError('Phone number must contain exactly 10 digits.')
      return
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First name and last name are required.')
      return
    }

    if (!form.address.trim()) {
      setError('Address is required.')
      return
    }

    if (
      form.dateOfBirth &&
      new Date(form.dateOfBirth) >= new Date(new Date().toDateString())
    ) {
      setError('Date of birth must be in the past.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const response = await api.put('/api/employees/me/profile', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address.trim(),
      })

      setProfile(response.data)
      setForm({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phoneNumber: response.data.phoneNumber || '',
        dateOfBirth: response.data.dateOfBirth || '',
        address: response.data.address || '',
      })

      setEditing(false)
      setSuccess('Your profile has been updated successfully.')
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update your profile. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const accountName = user?.username || user?.name || user?.email?.split('@')[0] || 'User'
  const displayName = isEmployee
    ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || accountName
    : accountName

  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const roleLabel = {
    ADMIN: 'Administrator',
    HR: 'HR Manager',
    EMPLOYEE: 'Employee',
  }[role] || role

  if (loading) {
    return (
      <div className="profile-loading">
        <RefreshCw size={25} className="profile-loading-icon" />
        <p>Loading your profile...</p>
      </div>
    )
  }

  if (isEmployee && !profile) {
    return (
      <div className="profile-error">
        <AlertCircle size={30} />
        <h3>Profile unavailable</h3>
        <p>{error || 'Unable to load your profile.'}</p>
        <button onClick={loadProfile}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <section className="profile-welcome">
        <div>
          <span className="profile-eyebrow">MY WORKSPACE</span>
          <h1>My Profile</h1>
          <p>View and manage your IntelliHR account information.</p>
        </div>

        <div className="profile-welcome-icon">
          <UserRound size={27} />
        </div>
      </section>

      {error && (
        <div className="profile-message error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="profile-message success" role="status">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <section className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar-large">
            {initials || <UserRound size={29} />}
          </div>

          <div className="profile-heading-info">
            <h2>{displayName}</h2>
            <p>{user?.email || profile?.email || 'Email not available'}</p>

            <div className="profile-badges">
              <span className="profile-role">
                <ShieldCheck size={14} />
                {roleLabel}
              </span>

              {isEmployee && (
                <span className={`profile-status ${profile.active ? 'active' : 'inactive'}`}>
                  <span className="profile-status-dot" />
                  {profile.active ? 'Active Employee' : 'Inactive Employee'}
                </span>
              )}
            </div>
          </div>

          {isEmployee && !editing && (
            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setEditing(true)
                setSuccess('')
                setError('')
              }}
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {isEmployee ? (
          <>
            <div className="profile-section-heading">
              <div>
                <h3>Personal Information</h3>
                <p>Manage your personal and contact details.</p>
              </div>
              <BadgeCheck size={21} />
            </div>

            <form onSubmit={handleSave}>
              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>First Name *</span>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    disabled={!editing}
                    maxLength={50}
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Last Name *</span>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    disabled={!editing}
                    maxLength={50}
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Email Address</span>
                  <div className="profile-input-with-icon">
                    <Mail size={16} />
                    <input value={profile.email || ''} disabled />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Phone Number *</span>
                  <div className="profile-input-with-icon">
                    <Phone size={16} />
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      disabled={!editing}
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      required
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Date of Birth</span>
                  <div className="profile-input-with-icon">
                    <CalendarDays size={16} />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      disabled={!editing}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Joining Date</span>
                  <div className="profile-input-with-icon">
                    <CalendarDays size={16} />
                    <input value={formatDate(profile.joiningDate)} disabled />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Department</span>
                  <div className="profile-input-with-icon">
                    <Building2 size={16} />
                    <input value={profile.department || '—'} disabled />
                  </div>
                </label>

                <label className="profile-field">
                  <span>Designation</span>
                  <div className="profile-input-with-icon">
                    <BriefcaseBusiness size={16} />
                    <input value={profile.designation || '—'} disabled />
                  </div>
                </label>

                <label className="profile-field profile-address-field">
                  <span>Address *</span>
                  <div className="profile-input-with-icon profile-textarea-wrap">
                    <MapPin size={16} />
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      disabled={!editing}
                      maxLength={500}
                      rows={4}
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="profile-readonly-note">
                <div>
                  <span>Employee ID</span>
                  <strong>#{profile.id}</strong>
                </div>
                <div>
                  <span>Employment Status</span>
                  <strong>{profile.active ? 'Active' : 'Inactive'}</strong>
                </div>
              </div>

              {editing && (
                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={saving}
                  >
                    {saving
                      ? <RefreshCw size={16} className="profile-loading-icon" />
                      : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <>
            <div className="profile-section-heading">
              <div>
                <h3>Account Information</h3>
                <p>Your IntelliHR account details and access level.</p>
              </div>
              <ShieldCheck size={21} />
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <UserRound size={19} />
                </div>
                <div>
                  <span>Account Name</span>
                  <strong>{displayName}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <Mail size={19} />
                </div>
                <div>
                  <span>Email Address</span>
                  <strong>{user?.email || '—'}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <span>Account Role</span>
                  <strong>{roleLabel}</strong>
                </div>
              </div>

              <div className="profile-detail">
                <div className="profile-detail-icon">
                  <BadgeCheck size={19} />
                </div>
                <div>
                  <span>Access Level</span>
                  <strong>{role}</strong>
                </div>
              </div>
            </div>

            <div className="profile-readonly-note">
              <ShieldCheck size={17} />
              <span>
                Your account identity and role are managed by IntelliHR.
                For password and appearance preferences, visit Settings.
              </span>
            </div>
          </>
        )}
      </section>

      <footer className="profile-footer">
        <span>© 2026 IntelliHR. All rights reserved.</span>
        <span>People first. Progress together.</span>
      </footer>
    </div>
  )
}

export default Profile