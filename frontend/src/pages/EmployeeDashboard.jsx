
import { useEffect, useState } from 'react'
import './EmployeeDashboard.css'
import {
  UserRound, CalendarCheck, ClipboardList, Wallet,
  Clock3, CheckCircle2, XCircle, AlertCircle,
  RefreshCw, Building2, BriefcaseBusiness
} from 'lucide-react'
import api from '../services/api'

function formatDate(value) {
  if (!value) return 'Ã¢â‚¬â€'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function StatusBadge({ status }) {
  const value = String(status || 'UNKNOWN').toUpperCase()

  const className =
    value === 'APPROVED' || value === 'PRESENT' || value === 'PAID'
      ? 'employee-status success'
      : value === 'REJECTED' || value === 'ABSENT'
        ? 'employee-status danger'
        : value === 'PENDING' || value === 'DRAFT'
          ? 'employee-status warning'
          : 'employee-status neutral'

  return <span className={className}>{value.replaceAll('_', ' ')}</span>
}

function EmployeeDashboard({ user, notifications = [] }) {
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEmployeeDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      // First get the logged-in employee's actual database profile.
      const profileResponse = await api.get('/api/employees/me/profile')
      const employee = profileResponse.data

      setProfile(employee)

      // Load only this employee's own records.
      const results = await Promise.allSettled([
        api.get(`/api/attendance/employee/${employee.id}`),
        api.get(`/api/leaves/employee/${employee.id}`),
        api.get(`/api/payroll/employee/${employee.id}`),
      ])

      setAttendance(
        results[0].status === 'fulfilled'
          ? results[0].value.data || []
          : []
      )

      setLeaves(
        results[1].status === 'fulfilled'
          ? results[1].value.data || []
          : []
      )

      setPayroll(
        results[2].status === 'fulfilled'
          ? results[2].value.data || []
          : []
      )

      const failedModules = results
        .map((result, index) => result.status === 'rejected'
          ? ['attendance', 'leave', 'payroll'][index]
          : null)
        .filter(Boolean)

      if (failedModules.length > 0) {
        console.error('Some employee dashboard modules could not load:', failedModules)
      }
    } catch (err) {
      console.error('Employee dashboard loading failed:', err)
      setError(
        err.response?.data?.message ||
        'Unable to load your employee profile. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployeeDashboard()
  }, [])

  const presentDays = attendance.filter(
    item => String(item.status).toUpperCase() === 'PRESENT'
  ).length

  const pendingLeaves = leaves.filter(
    item => String(item.status).toUpperCase() === 'PENDING'
  ).length

  const latestPayroll = [...payroll].sort((a, b) => {
    const dateA = new Date(a.createdAt || `${a.year}-${a.month || 1}-01`)
    const dateB = new Date(b.createdAt || `${b.year}-${b.month || 1}-01`)
    return dateB - dateA
  })[0]

  const recentAttendance = [...attendance]
    .sort((a, b) =>
      new Date(b.attendanceDate) - new Date(a.attendanceDate)
    )
    .slice(0, 5)

  const recentLeaves = [...leaves]
    .sort((a, b) =>
      new Date(b.createdAt || b.startDate) -
      new Date(a.createdAt || a.startDate)
    )
    .slice(0, 5)

  if (loading) {
    return (
      <div className="employee-dashboard-loading">
        <RefreshCw size={25} className="employee-loading-icon" />
        <p>Loading your employee dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="employee-dashboard-error">
        <AlertCircle size={30} />
        <h3>Dashboard unavailable</h3>
        <p>{error}</p>
        <button onClick={loadEmployeeDashboard}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    )
  }

  const employeeName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : user?.username || 'Employee'

  const unreadNotifications = notifications.filter(
    item => !item.read
  ).length

  return (
    <div className="employee-dashboard">

      <section className="employee-welcome">
        <div>
          <p className="eyebrow">MY WORKSPACE</p>
          <h1>Welcome, {profile?.firstName || employeeName}!</h1>
          <p>Here's your personal work and HR overview.</p>
        </div>

      </section>

      <section className="employee-profile-card">
        <div className="employee-profile-heading">
          <div className="employee-profile-icon">
            <UserRound size={23} />
          </div>

          <div>
            <h3>My Profile</h3>
            <p>Your employee information</p>
          </div>
        </div>

        <div className="employee-profile-details">
          <div>
            <span>Employee Name</span>
            <strong>{employeeName || 'Ã¢â‚¬â€'}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{profile?.email || user?.email || 'Ã¢â‚¬â€'}</strong>
          </div>

          <div>
            <span>Department</span>
            <strong>{profile?.department || 'Ã¢â‚¬â€'}</strong>
          </div>

          <div>
            <span>Designation</span>
            <strong>{profile?.designation || 'Ã¢â‚¬â€'}</strong>
          </div>

          <div>
            <span>Employee ID</span>
            <strong>#{profile?.id ?? 'Ã¢â‚¬â€'}</strong>
          </div>

          <div>
            <span>Employment Status</span>
            <StatusBadge status={profile?.active ? 'ACTIVE' : 'INACTIVE'} />
          </div>
        </div>
      </section>

      <section className="employee-stats-grid">

        <article className="employee-stat-card">
          <div className="employee-stat-icon purple">
            <CalendarCheck size={21} />
          </div>
          <p>Present Days</p>
          <h2>{presentDays}</h2>
          <span>Recorded attendance</span>
        </article>

        <article className="employee-stat-card">
          <div className="employee-stat-icon orange">
            <ClipboardList size={21} />
          </div>
          <p>Pending Leaves</p>
          <h2>{pendingLeaves}</h2>
          <span>Awaiting review</span>
        </article>

        <article className="employee-stat-card">
          <div className="employee-stat-icon green">
            <Wallet size={21} />
          </div>
          <p>Latest Net Salary</p>
          <h2>{latestPayroll ? formatCurrency(latestPayroll.netSalary) : 'Ã¢â‚¬â€'}</h2>
          <span>
            {latestPayroll
              ? `${latestPayroll.month}/${latestPayroll.year}`
              : 'No payroll record'}
          </span>
        </article>

        <article className="employee-stat-card">
          <div className="employee-stat-icon blue">
            <AlertCircle size={21} />
          </div>
          <p>Unread Notifications</p>
          <h2>{unreadNotifications}</h2>
          <span>New updates</span>
        </article>

      </section>

      <section className="employee-dashboard-grid">

        <article className="employee-panel">
          <div className="employee-panel-header">
            <div>
              <h3>My Attendance</h3>
              <p>Your latest attendance records</p>
            </div>
            <CalendarCheck size={20} />
          </div>

          {recentAttendance.length === 0 ? (
            <div className="employee-empty-state">
              No attendance records found.
            </div>
          ) : (
            <div className="employee-record-list">
              {recentAttendance.map(item => (
                <div className="employee-record-row" key={item.id}>
                  <div>
                    <strong>{formatDate(item.attendanceDate)}</strong>
                    <span>
                      {item.checkInTime || 'Ã¢â‚¬â€'} Ã¢â‚¬â€œ {item.checkOutTime || 'Ã¢â‚¬â€'}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="employee-panel">
          <div className="employee-panel-header">
            <div>
              <h3>My Leave Requests</h3>
              <p>Recent leave applications</p>
            </div>
            <ClipboardList size={20} />
          </div>

          {recentLeaves.length === 0 ? (
            <div className="employee-empty-state">
              No leave requests found.
            </div>
          ) : (
            <div className="employee-record-list">
              {recentLeaves.map(item => (
                <div className="employee-record-row" key={item.id}>
                  <div>
                    <strong>{item.leaveType || 'Leave'}</strong>
                    <span>
                      {formatDate(item.startDate)} Ã¢â‚¬â€œ {formatDate(item.endDate)}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          )}
        </article>

      </section>

      <section className="employee-panel employee-payroll-panel">
        <div className="employee-panel-header">
          <div>
            <h3>My Payroll</h3>
            <p>Your salary records</p>
          </div>
          <Wallet size={20} />
        </div>

        {payroll.length === 0 ? (
          <div className="employee-empty-state">
            No payroll records found.
          </div>
        ) : (
          <div className="employee-table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {[...payroll]
                  .sort((a, b) => (b.year - a.year) || (b.month - a.month))
                  .slice(0, 5)
                  .map(item => (
                    <tr key={item.id}>
                      <td>{item.month}/{item.year}</td>
                      <td>{formatCurrency(item.grossSalary)}</td>
                      <td>{formatCurrency(item.deductions)}</td>
                      <td><strong>{formatCurrency(item.netSalary)}</strong></td>
                      <td><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="employee-panel employee-notifications-panel">
        <div className="employee-panel-header">
          <div>
            <h3>Recent Notifications</h3>
            <p>Your latest HR updates</p>
          </div>
          <AlertCircle size={20} />
        </div>

        {notifications.length === 0 ? (
          <div className="employee-empty-state">
            No notifications yet.
          </div>
        ) : (
          <div className="employee-record-list">
            {notifications.slice(0, 5).map(item => (
              <div className="employee-notification-row" key={item.id}>
                <div className="employee-notification-icon">
                  {item.read
                    ? <CheckCircle2 size={18} />
                    : <Clock3 size={18} />}
                </div>

                <div>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>{formatDate(item.createdAt)}</small>
                </div>

                {!item.read && <span className="employee-unread-dot" />}
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>Ã‚Â© 2026 IntelliHR. All rights reserved.</span>
        <span>People first. Progress together.</span>
      </footer>

    </div>
  )
}

export default EmployeeDashboard
