
import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  X,
  Plus,
  Ban,
} from 'lucide-react'
import api from '../services/api'
import './Leaves.css'

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('intellihr_user') || '{}')
  } catch {
    return {}
  }
}

function Leaves({ onLeavesUpdated }) {
  const currentUser = getStoredUser()
  const userRole = currentUser.role?.replace('ROLE_', '').toUpperCase()
  const isEmployee = userRole === 'EMPLOYEE'

  const [leaves, setLeaves] = useState([])
  const [employeeId, setEmployeeId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [leaveBalances, setLeaveBalances] = useState([])
  const [balanceError, setBalanceError] = useState('')
  const [balanceSearch, setBalanceSearch] = useState('')
  const [balancePage, setBalancePage] = useState(1)
  const [expandedEmployees, setExpandedEmployees] = useState({})

  const [selectedLeave, setSelectedLeave] = useState(null)
  const [reviewStatus, setReviewStatus] = useState('')
  const [reviewerRemarks, setReviewerRemarks] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const [applyOpen, setApplyOpen] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      setError('')

      if (isEmployee) {
        const profileResponse = await api.get('/api/employees/me/profile')
        const id = profileResponse.data.id

        setEmployeeId(id)

        const response = await api.get(
          `/api/leaves/employee/${id}`
        )

        setLeaves(Array.isArray(response.data) ? response.data : [])
      } else {
        const response = await api.get('/api/leaves')
        setLeaves(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load leave records. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const fetchBalances = async () => {
    try {
      setBalanceError('')
      const year = new Date().getFullYear()
      const endpoint = isEmployee
        ? '/api/leaves/balance/me?year=' + year
        : '/api/leaves/balances?year=' + year
      const response = await api.get(endpoint)
      setLeaveBalances(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setLeaveBalances([])
      setBalanceError(err.response?.data?.message || 'Unable to load leave balances.')
    }
  }

  useEffect(() => {
    fetchLeaves()
    fetchBalances()
  }, [])

  const openReviewDialog = (leave, status) => {
    setSelectedLeave(leave)
    setReviewStatus(status)
    setReviewerRemarks('')
    setError('')
    setSuccess('')
  }

  const closeReviewDialog = () => {
    if (reviewLoading) return

    setSelectedLeave(null)
    setReviewStatus('')
    setReviewerRemarks('')
  }

  const submitReview = async () => {
    if (!selectedLeave) return

    if (reviewerRemarks.trim().length > 500) {
      setError('Reviewer remarks cannot exceed 500 characters.')
      return
    }

    try {
      setReviewLoading(true)
      setError('')
      setSuccess('')

      await api.patch(
        `/api/leaves/${selectedLeave.id}/review`,
        {
          status: reviewStatus,
          reviewerRemarks: reviewerRemarks.trim() || null,
        }
      )

      setSuccess(
        `Leave request #${selectedLeave.id} ${reviewStatus.toLowerCase()} successfully.`
      )

      setSelectedLeave(null)
      setReviewStatus('')
      setReviewerRemarks('')

      await fetchLeaves()
      await fetchBalances()
      await onLeavesUpdated?.()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to review leave request. Please try again.'
      )
    } finally {
      setReviewLoading(false)
    }
  }

  const openApplyDialog = () => {
    setLeaveForm({
      leaveType: 'CASUAL',
      startDate: '',
      endDate: '',
      reason: '',
    })
    setError('')
    setSuccess('')
    setApplyOpen(true)
  }

  const closeApplyDialog = () => {
    if (applyLoading) return
    setApplyOpen(false)
  }

  const submitLeaveApplication = async (event) => {
    event.preventDefault()


    if (leaveForm.endDate < leaveForm.startDate) {
      setError('End date cannot be earlier than start date.')
      return
    }

    if (!leaveForm.reason.trim()) {
      setError('Please enter a reason for your leave.')
      return
    }

    try {
      setApplyLoading(true)
      setError('')
      setSuccess('')

      await api.post('/api/leaves', {
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason.trim(),
      })

      setApplyOpen(false)
      setSuccess('Your leave application has been submitted successfully.')

      await fetchLeaves()
      await fetchBalances()
      await onLeavesUpdated?.()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to submit leave application. Please try again.'
      )
    } finally {
      setApplyLoading(false)
    }
  }

  const cancelLeave = async (leave) => {
    if (leave.status !== 'PENDING') return

    if (!window.confirm(`Cancel leave request #${leave.id}?`)) return

    try {
      setError('')
      setSuccess('')

      await api.patch(`/api/leaves/${leave.id}/cancel`)

      setSuccess(`Leave request #${leave.id} cancelled successfully.`)

      await fetchLeaves()
      await fetchBalances()
      await onLeavesUpdated?.()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to cancel leave request. Please try again.'
      )
    }
  }

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch =
      (leave.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(leave.employeeId || '').includes(search) ||
      (leave.leaveType || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' || leave.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'approved'
      case 'REJECTED':
        return 'rejected'
      case 'CANCELLED':
        return 'cancelled'
      default:
        return 'pending'
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'

    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const pendingCount = leaves.filter(
    (leave) => leave.status === 'PENDING'
  ).length

  const approvedCount = leaves.filter(
    (leave) => leave.status === 'APPROVED'
  ).length

  const rejectedCount = leaves.filter(
    (leave) => leave.status === 'REJECTED'
  ).length

  const groupedLeaveBalances = Object.values(
    leaveBalances.reduce((groups, balance) => {
      const id = String(balance.employeeId)

      if (!groups[id]) {
        groups[id] = {
          employeeId: balance.employeeId,
          employeeName: balance.employeeName || 'Employee',
          year: balance.year,
          leaveTypes: [],
          allocatedDays: 0,
          usedDays: 0,
          remainingDays: 0,
        }
      }

      groups[id].leaveTypes.push(balance)
      groups[id].allocatedDays += balance.allocatedDays
      groups[id].usedDays += balance.usedDays
      groups[id].remainingDays += balance.remainingDays

      return groups
    }, {})
  )

  const filteredBalanceEmployees = groupedLeaveBalances.filter((employee) => {
    const query = balanceSearch.trim().toLowerCase()

    return (
      employee.employeeName.toLowerCase().includes(query) ||
      String(employee.employeeId).includes(query)
    )
  })

  const balancePageSize = 10
  const totalBalancePages = Math.max(
    1,
    Math.ceil(filteredBalanceEmployees.length / balancePageSize)
  )

  const paginatedBalanceEmployees = filteredBalanceEmployees.slice(
    (balancePage - 1) * balancePageSize,
    balancePage * balancePageSize
  )
  return (
    <div className="leaves-page">
      <div className="leaves-header">
        <div>
          <h1>{isEmployee ? 'My Leave Management' : 'Leave Management'}</h1>
          <p>
            {isEmployee
              ? 'Apply for leave and track your leave requests.'
              : 'Track and manage employee leave requests.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isEmployee && (
            <button className="leave-refresh-btn" onClick={openApplyDialog}>
              <Plus size={16} />
              Apply for Leave
            </button>
          )}

          <button className="leave-refresh-btn" onClick={() => { fetchLeaves(); fetchBalances() }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="leave-feedback error">
          {error}
        </div>
      )}

      {success && (
        <div className="leave-feedback success">
          {success}
        </div>
      )}

      <div className="leave-stats-grid">
        <div className="leave-stat-card">
          <div className="leave-stat-icon total">
            <FileText size={20} />
          </div>
          <div>
            <span>Total Requests</span>
            <h2>{leaves.length}</h2>
          </div>
        </div>

        <div className="leave-stat-card">
          <div className="leave-stat-icon pending">
            <Clock size={20} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="leave-stat-card">
          <div className="leave-stat-icon approved">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Approved</span>
            <h2>{approvedCount}</h2>
          </div>
        </div>

        <div className="leave-stat-card">
          <div className="leave-stat-icon rejected">
            <XCircle size={20} />
          </div>
          <div>
            <span>Rejected</span>
            <h2>{rejectedCount}</h2>
          </div>
        </div>
      </div>

      <section className="leave-balance-section">
        <div className="leave-balance-heading">
          <div>
            <h2>{isEmployee ? 'My Leave Balance' : 'Employee Leave Balances'}</h2>
            <p>Annual leave allocation and usage for {new Date().getFullYear()}</p>
          </div>
        </div>

        {balanceError && (
          <div className="leave-feedback error">{balanceError}</div>
        )}

        {isEmployee ? (
          <div className="leave-balance-grid">
            {leaveBalances.map((balance) => (
              <div className={`leave-balance-card ${balance.leaveType?.toLowerCase()}`} key={balance.leaveType}>
                <div className="leave-balance-card-top">
                  <h3>{balance.leaveType?.replaceAll('_', ' ') || 'Leave'}</h3>
                  <span>{balance.year}</span>
                </div>
                <div className="leave-balance-remaining">
                  <strong>{balance.remainingDays}</strong>
                  <span>Days remaining</span>
                </div>
                <div className="leave-balance-details">
                  <div>
                    <span>Allocated</span>
                    <strong>{balance.allocatedDays}</strong>
                  </div>
                  <div>
                    <span>Used</span>
                    <strong>{balance.usedDays}</strong>
                  </div>
                </div>
                <div className="leave-balance-progress">
                  <div
                    style={{
                      width: `${balance.allocatedDays > 0 ? Math.min(100, Math.max(0, balance.usedDays / balance.allocatedDays * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!balanceError && leaveBalances.length === 0 && (
              <p className="leave-balance-empty">No leave balance information available.</p>
            )}
          </div>
        ) : (
          <>
            <div className="leave-balance-toolbar">
              <div className="leave-balance-result-count">
                <strong>{filteredBalanceEmployees.length}</strong>
                <span>Employees</span>
              </div>

              <div className="leave-balance-search">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search employee name or ID..."
                  value={balanceSearch}
                  onChange={(event) => {
                    setBalanceSearch(event.target.value)
                    setBalancePage(1)
                  }}
                />
              </div>
            </div>

            <div className="leaves-table-wrapper">
              <table className="leaves-table leave-balances-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Allocated</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Year</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBalanceEmployees.map((employee) => (
                    <>
                      <tr key={employee.employeeId} className="leave-balance-employee-row">
                        <td>
                          <strong>{employee.employeeName}</strong>
                        </td>
                        <td>#{employee.employeeId}</td>
                        <td>{employee.allocatedDays}</td>
                        <td>{employee.usedDays}</td>
                        <td>
                          <strong className="leave-balance-total-remaining">
                            {employee.remainingDays}
                          </strong>
                        </td>
                        <td>{employee.year}</td>
                        <td>
                          <button
                            type="button"
                            className="leave-balance-expand-btn"
                            onClick={() =>
                              setExpandedEmployees((current) => ({
                                ...current,
                                [employee.employeeId]: !current[employee.employeeId],
                              }))
                            }
                          >
                            {expandedEmployees[employee.employeeId]
                              ? 'Hide details'
                              : 'View details'}
                          </button>
                        </td>
                      </tr>

                      {expandedEmployees[employee.employeeId] && (
                        <tr
                          key={`${employee.employeeId}-details`}
                          className="leave-balance-details-row"
                        >
                          <td colSpan={7}>
                            <div className="leave-balance-expanded">
                              <h4>Leave type breakdown</h4>
                              <table className="leave-balance-detail-table">
                                <thead>
                                  <tr>
                                    <th>Leave Type</th>
                                    <th>Allocated</th>
                                    <th>Used</th>
                                    <th>Remaining</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {employee.leaveTypes.map((balance) => (
                                    <tr key={`${employee.employeeId}-${balance.leaveType}`}>
                                      <td>
                                        {balance.leaveType?.replaceAll('_', ' ')}
                                      </td>
                                      <td>{balance.allocatedDays}</td>
                                      <td>{balance.usedDays}</td>
                                      <td>
                                        <strong>{balance.remainingDays}</strong>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}

                  {filteredBalanceEmployees.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <p className="leave-balance-empty">
                          {balanceSearch
                            ? 'No employees match your search.'
                            : 'No leave balance records available.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredBalanceEmployees.length > 0 && (
              <div className="leave-balance-pagination">
                <span>
                  Showing {(balancePage - 1) * balancePageSize + 1}–
                  {Math.min(
                    balancePage * balancePageSize,
                    filteredBalanceEmployees.length
                  )}{' '}
                  of {filteredBalanceEmployees.length} employees
                </span>

                <div>
                  <button
                    type="button"
                    disabled={balancePage === 1}
                    onClick={() => setBalancePage((page) => page - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {balancePage} of {totalBalancePages}
                  </span>
                  <button
                    type="button"
                    disabled={balancePage >= totalBalancePages}
                    onClick={() => setBalancePage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>        )}
      </section>
      <div className="leaves-content-card">
        <div className="leaves-toolbar">
          <div>
            <h2>Leave Requests</h2>
            <p>
              {isEmployee
                ? 'Your leave applications and their current status.'
                : 'Employee leave applications'}
            </p>
          </div>

          <div className="leaves-filters">
            <div className="leave-search">
              <Search size={17} />
              <input
                type="text"
                placeholder={
                  isEmployee
                    ? 'Search leave type...'
                    : 'Search employee or leave type...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="leaves-message">
            Loading leave requests...
          </div>
        ) : error && leaves.length === 0 ? (
          <div className="leaves-message error">{error}</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="leaves-empty">
            <CalendarDays size={38} />
            <h3>No leave requests found</h3>
            <p>
              {isEmployee
                ? 'You have not submitted any leave applications yet.'
                : 'Leave applications will appear here when available.'}
            </p>
          </div>
        ) : (
          <div className="leaves-table-wrapper">
            <table className="leaves-table">
              <thead>
                <tr>
                  {!isEmployee && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Reviewer Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    {!isEmployee && (
                      <td>
                        <div className="leave-employee">
                          <div className="leave-avatar">
                            {leave.employeeName?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <strong>{leave.employeeName || 'Employee'}</strong>
                            <span>ID: {leave.employeeId}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    <td>{leave.leaveType?.replaceAll('_', ' ') || '—'}</td>

                    <td>
                      <div className="leave-duration">
                        <strong>{formatDate(leave.startDate)}</strong>
                        <span>to {formatDate(leave.endDate)}</span>
                      </div>
                    </td>

                    <td className="leave-reason" title={leave.reason}>
                      {leave.reason || '—'}
                    </td>

                    <td>
                      <span className={`leave-status ${getStatusClass(leave.status)}`}>
                        {leave.status?.replaceAll('_', ' ') || 'UNKNOWN'}
                      </span>
                    </td>

                    <td>
                      {formatDate(leave.createdAt?.slice(0, 10))}
                    </td>

                    <td>{leave.reviewerRemarks || '—'}</td>

                    <td>
                      {!isEmployee && leave.status === 'PENDING' ? (
                        <div className="leave-action-buttons">
                          <button
                            className="leave-approve-btn"
                            onClick={() => openReviewDialog(leave, 'APPROVED')}
                            title="Approve leave"
                          >
                            <Check size={15} />
                            Approve
                          </button>

                          <button
                            className="leave-reject-btn"
                            onClick={() => openReviewDialog(leave, 'REJECTED')}
                            title="Reject leave"
                          >
                            <X size={15} />
                            Reject
                          </button>
                        </div>
                      ) : isEmployee && leave.status === 'PENDING' ? (
                        <button
                          className="leave-reject-btn"
                          onClick={() => cancelLeave(leave)}
                          title="Cancel leave request"
                        >
                          <Ban size={15} />
                          Cancel
                        </button>
                      ) : (
                        <span className="leave-no-action">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="leaves-footer">
            Showing {filteredLeaves.length} of {leaves.length} leave requests
          </div>
        )}
      </div>

      {applyOpen && (
        <div className="leave-modal-overlay">
          <div className="leave-review-modal leave-apply-modal">
            <div className="leave-modal-header">
              <div>
                <h2>Apply for Leave</h2>
                <p>Submit your leave application for review.</p>
              </div>

              <button
                className="leave-modal-close"
                onClick={closeApplyDialog}
                disabled={applyLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitLeaveApplication}>
              <div className="leave-review-details">
                <label>
                  Leave Type
                  <select
                    value={leaveForm.leaveType}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, leaveType: e.target.value })
                    }
                    required
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Sick Leave</option>
                    <option value="EARNED">Earned Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </label>

                <label>
                  Start Date
                  <input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, startDate: e.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  End Date
                  <input
                    type="date"
                    min={leaveForm.startDate || undefined}
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, endDate: e.target.value })
                    }
                    required
                  />
                </label>
              </div>

              <label className="leave-remarks-label">
                Reason for Leave
              </label>

              <textarea
                className="leave-remarks-input"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
                placeholder="Explain why you need leave..."
                maxLength={500}
                rows={4}
                required
              />

              <div className="leave-remarks-count">
                {leaveForm.reason.length}/500 characters
              </div>

              <div className="leave-modal-actions">
                <button
                  type="button"
                  className="leave-cancel-btn"
                  onClick={closeApplyDialog}
                  disabled={applyLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-confirm-approve"
                  disabled={applyLoading}
                >
                  {applyLoading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLeave && (
        <div className="leave-modal-overlay">
          <div className="leave-review-modal">
            <div className="leave-modal-header">
              <div>
                <h2>
                  {reviewStatus === 'APPROVED'
                    ? 'Approve Leave Request'
                    : 'Reject Leave Request'}
                </h2>
                <p>
                  Leave #{selectedLeave.id} · {selectedLeave.employeeName}
                </p>
              </div>

              <button
                className="leave-modal-close"
                onClick={closeReviewDialog}
                disabled={reviewLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div className="leave-review-details">
              <span>Leave Type</span>
              <strong>{selectedLeave.leaveType}</strong>

              <span>Duration</span>
              <strong>
                {formatDate(selectedLeave.startDate)} – {formatDate(selectedLeave.endDate)}
              </strong>

              <span>Employee Reason</span>
              <strong>{selectedLeave.reason || '—'}</strong>
            </div>

            <label className="leave-remarks-label">
              Reviewer Remarks
            </label>

            <textarea
              className="leave-remarks-input"
              value={reviewerRemarks}
              onChange={(e) => setReviewerRemarks(e.target.value)}
              placeholder="Enter your remarks (optional)..."
              maxLength={500}
              rows={4}
            />

            <div className="leave-remarks-count">
              {reviewerRemarks.length}/500 characters
            </div>

            <div className="leave-modal-actions">
              <button
                className="leave-cancel-btn"
                onClick={closeReviewDialog}
                disabled={reviewLoading}
              >
                Cancel
              </button>

              <button
                className={
                  reviewStatus === 'APPROVED'
                    ? 'leave-confirm-approve'
                    : 'leave-confirm-reject'
                }
                onClick={submitReview}
                disabled={reviewLoading}
              >
                {reviewLoading
                  ? 'Processing...'
                  : reviewStatus === 'APPROVED'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leaves
