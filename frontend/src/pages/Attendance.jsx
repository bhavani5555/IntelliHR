import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, Clock, RefreshCw, Search, Pencil,
  Trash2, X, Save, Users, CheckCircle2, XCircle,
  Timer, AlertCircle, LogIn, LogOut
} from 'lucide-react'
import api from '../services/api'
import './Attendance.css'

const statusLabels = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LATE: 'Late'
}

function Attendance() {
  const storedUser = JSON.parse(localStorage.getItem('intellihr_user') || '{}')
  const userRole = storedUser.role?.replace('ROLE_', '').toUpperCase()
  const isEmployee = userRole === 'EMPLOYEE'
  const isAdmin = userRole === 'ADMIN'
  const canManage = ['ADMIN', 'HR'].includes(userRole)

  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [form, setForm] = useState({
    employeeId: '',
    attendanceDate: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'PRESENT',
    remarks: ''
  })

  const today = new Date().toLocaleDateString('en-CA')

  const loadAttendance = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      let response

      if (isEmployee) {
        const profileResponse = await api.get('/api/employees/me/profile')
        response = await api.get(
          `/api/attendance/employee/${profileResponse.data.id}`
        )
      } else {
        response = await api.get('/api/attendance')
      }

      setRecords(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view these attendance records.'
          : 'Unable to load attendance records. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }, [isEmployee])

  const loadEmployees = useCallback(async () => {
    if (!canManage) return

    try {
      const response = await api.get('/api/employees')
      setEmployees(Array.isArray(response.data) ? response.data : [])
    } catch {
      setError('Unable to load employee list. Please refresh the page.')
    }
  }, [canManage])

  useEffect(() => {
    loadAttendance()
    loadEmployees()
  }, [loadAttendance, loadEmployees])

  const todayRecord = useMemo(
    () => records.find((record) => record.attendanceDate === today),
    [records, today]
  )

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchText =
        `${record.employeeName || ''} ${record.employeeId || ''} ${record.status || ''} ${record.remarks || ''}`
          .toLowerCase()

      return (
        searchText.includes(search.toLowerCase()) &&
        (!dateFilter || record.attendanceDate === dateFilter) &&
        (statusFilter === 'ALL' || record.status === statusFilter)
      )
    })
  }, [records, search, dateFilter, statusFilter])

  const summary = useMemo(() => ({
    total: records.length,
    present: records.filter((r) => r.status === 'PRESENT').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
    halfDay: records.filter((r) => r.status === 'HALF_DAY').length,
    late: records.filter((r) => r.status === 'LATE').length
  }), [records])

  const formatTime = (time) => time ? time.slice(0, 5) : '—'

  const handleAttendanceAction = async (action) => {
    setActionLoading(action)
    setError('')
    setSuccess('')

    try {
      const endpoint = action === 'check-in'
        ? '/api/attendance/check-in'
        : '/api/attendance/check-out'

      await api.post(endpoint)

      setSuccess(
        action === 'check-in'
          ? 'Check In successful. Your attendance has been recorded.'
          : 'Check Out successful. Your attendance has been updated.'
      )

      await loadAttendance()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.status === 403
          ? 'You are not allowed to perform this attendance action.'
          : 'Unable to update attendance. Please try again.')
      )
    } finally {
      setActionLoading('')
    }
  }

  const openEditModal = (record) => {
    setEditingRecord(record)
    setForm({
      employeeId: String(record.employeeId),
      attendanceDate: record.attendanceDate || '',
      checkInTime: record.checkInTime?.slice(0, 5) || '',
      checkOutTime: record.checkOutTime?.slice(0, 5) || '',
      status: record.status || 'PRESENT',
      remarks: record.remarks || ''
    })
    setError('')
    setSuccess('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingRecord(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.employeeId || !form.attendanceDate || !form.status) {
      setError('Please fill all required fields.')
      return
    }

    if (form.attendanceDate > today) {
      setError('Future attendance dates are not allowed.')
      return
    }

    if (
      form.checkInTime &&
      form.checkOutTime &&
      form.checkOutTime < form.checkInTime
    ) {
      setError('Check-out time cannot be before check-in time.')
      return
    }

    const payload = {
      employeeId: Number(form.employeeId),
      attendanceDate: form.attendanceDate,
      checkInTime: form.checkInTime || null,
      checkOutTime: form.checkOutTime || null,
      status: form.status,
      remarks: form.remarks.trim()
    }

    setSaving(true)

    try {
      await api.put(`/api/attendance/${editingRecord.id}`, payload)
      setSuccess('Attendance record corrected successfully.')
      setModalOpen(false)
      setEditingRecord(null)
      await loadAttendance()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'Attendance already exists for this employee on this date.'
          : 'Unable to update attendance. Please try again.')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Delete attendance record for ${record.employeeName} on ${record.attendanceDate}? This action cannot be undone.`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    try {
      await api.delete(`/api/attendance/${record.id}`)
      setSuccess('Attendance record deleted successfully.')
      await loadAttendance()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Unable to delete attendance record.'
      )
    }
  }

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === form.employeeId
  )

  const hasCheckedIn = Boolean(todayRecord?.checkInTime)
  const hasCheckedOut = Boolean(todayRecord?.checkOutTime)

  return (
    <div className="attendance-page">
      <div className="attendance-heading">
        <div>
          <h2>{isEmployee ? 'My Attendance' : 'Attendance Management'}</h2>
          <p>
            {isEmployee
              ? 'Record your daily check-in and check-out and review your attendance.'
              : 'Monitor employee attendance, review records and correct attendance details.'}
          </p>
        </div>

        <div className="attendance-heading-actions">
          <div className="attendance-total">
            <CalendarDays size={18} />
            <span>{summary.total} Records</span>
          </div>
        </div>
      </div>

      {isEmployee && (
        <section className="attendance-self-service">
          <div className="attendance-self-service-heading">
            <div>
              <span className="attendance-today-label">TODAY</span>
              <h3>Daily Attendance</h3>
              <p>{today}</p>
            </div>
            <span className={`attendance-status ${
              hasCheckedOut ? 'present' : hasCheckedIn ? 'late' : 'absent'
            }`}>
              {hasCheckedOut
                ? 'Completed'
                : hasCheckedIn
                  ? 'Checked In'
                  : 'Not Checked In'}
            </span>
          </div>

          <div className="attendance-today-times">
            <div className="attendance-today-time">
              <div className="attendance-today-time-icon check-in">
                <LogIn size={20} />
              </div>
              <div>
                <span>Check In Time</span>
                <strong>{formatTime(todayRecord?.checkInTime)}</strong>
              </div>
            </div>

            <div className="attendance-today-time">
              <div className="attendance-today-time-icon check-out">
                <LogOut size={20} />
              </div>
              <div>
                <span>Check Out Time</span>
                <strong>{formatTime(todayRecord?.checkOutTime)}</strong>
              </div>
            </div>
          </div>

          <div className="attendance-self-service-actions">
            <button
              className="attendance-check-button check-in"
              onClick={() => handleAttendanceAction('check-in')}
              disabled={loading || Boolean(actionLoading) || hasCheckedIn}
            >
              <LogIn size={18} />
              {actionLoading === 'check-in' ? 'Checking In...' : 'Check In'}
            </button>

            <button
              className="attendance-check-button check-out"
              onClick={() => handleAttendanceAction('check-out')}
              disabled={
                loading ||
                Boolean(actionLoading) ||
                !hasCheckedIn ||
                hasCheckedOut
              }
            >
              <LogOut size={18} />
              {actionLoading === 'check-out' ? 'Checking Out...' : 'Check Out'}
            </button>
          </div>

          <p className="attendance-self-service-note">
            Your attendance date and time are recorded automatically by the server.
          </p>
        </section>
      )}

      {!isEmployee && (
        <div className="attendance-summary">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon total"><Users size={21} /></div>
            <div><span>Total Records</span><strong>{summary.total}</strong></div>
          </div>
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon present"><CheckCircle2 size={21} /></div>
            <div><span>Present</span><strong>{summary.present}</strong></div>
          </div>
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon absent"><XCircle size={21} /></div>
            <div><span>Absent</span><strong>{summary.absent}</strong></div>
          </div>
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon half"><Timer size={21} /></div>
            <div><span>Half Day</span><strong>{summary.halfDay}</strong></div>
          </div>
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon late"><Clock size={21} /></div>
            <div><span>Late</span><strong>{summary.late}</strong></div>
          </div>
        </div>
      )}

      {success && (
        <div className="attendance-alert success">
          <CheckCircle2 size={17} /> {success}
          <button onClick={() => setSuccess('')} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="attendance-alert error">
          <AlertCircle size={17} /> {error}
          <button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button>
        </div>
      )}

      <div className="attendance-toolbar">
        <div className="attendance-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={isEmployee ? 'Search status or remarks...' : 'Search employee or status...'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <input
          className="attendance-filter"
          type="date"
          aria-label="Filter by date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />

        <select
          className="attendance-filter"
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="HALF_DAY">Half Day</option>
          <option value="LATE">Late</option>
        </select>

        <button
          className="attendance-refresh"
          onClick={loadAttendance}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? 'attendance-spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="attendance-table-card">
        {loading ? (
          <div className="attendance-message">Loading attendance records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="attendance-empty">
            <CalendarDays size={34} />
            <strong>No attendance records found</strong>
            <span>Try changing your search or filters.</span>
          </div>
        ) : (
          <div className="attendance-table-scroll">
            <table className="attendance-table">
              <thead>
                <tr>
                  {!isEmployee && <th>EMPLOYEE</th>}
                  <th>DATE</th>
                  <th>CHECK IN</th>
                  <th>CHECK OUT</th>
                  <th>STATUS</th>
                  <th>REMARKS</th>
                  {canManage && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    {!isEmployee && (
                      <td>
                        <div className="attendance-employee">
                          <strong>{record.employeeName || 'Unknown'}</strong>
                          <span>EMP-{record.employeeId}</span>
                        </div>
                      </td>
                    )}
                    <td>{record.attendanceDate || '—'}</td>
                    <td>
                      <span className="attendance-time">
                        <Clock size={14} />
                        {formatTime(record.checkInTime)}
                      </span>
                    </td>
                    <td>{formatTime(record.checkOutTime)}</td>
                    <td>
                      <span className={`attendance-status ${(record.status || '').toLowerCase()}`}>
                        {statusLabels[record.status] || record.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="attendance-remarks">{record.remarks || '—'}</td>
                    {canManage && (
                      <td>
                        <div className="attendance-actions">
                          <button
                            className="attendance-icon-button edit"
                            title="Correct attendance"
                            onClick={() => openEditModal(record)}
                          >
                            <Pencil size={16} />
                          </button>
                          {isAdmin && (
                            <button
                              className="attendance-icon-button delete"
                              title="Delete attendance"
                              onClick={() => handleDelete(record)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="attendance-footer">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {modalOpen && (
        <div
          className="attendance-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="attendance-modal">
            <div className="attendance-modal-header">
              <div>
                <h3>Correct Attendance</h3>
                <p>Update the selected employee attendance record.</p>
              </div>
              <button
                className="attendance-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="attendance-alert error modal-error">
                  <AlertCircle size={17} /> {error}
                </div>
              )}

              <div className="attendance-form-grid">
                <label className="attendance-form-field full">
                  <span>Employee <b>*</b></span>
                  <select
                    value={form.employeeId}
                    onChange={(event) => setForm({
                      ...form,
                      employeeId: event.target.value
                    })}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                        {!employee.active ? ' — Inactive' : ''}
                      </option>
                    ))}
                    {selectedEmployee && !employees.some(
                      (employee) => String(employee.id) === form.employeeId
                    ) && (
                      <option value={selectedEmployee.id}>
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </option>
                    )}
                  </select>
                </label>

                <label className="attendance-form-field">
                  <span>Attendance Date <b>*</b></span>
                  <input
                    type="date"
                    value={form.attendanceDate}
                    max={today}
                    onChange={(event) => setForm({
                      ...form,
                      attendanceDate: event.target.value
                    })}
                    required
                  />
                </label>

                <label className="attendance-form-field">
                  <span>Status <b>*</b></span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm({
                      ...form,
                      status: event.target.value
                    })}
                    required
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half Day</option>
                    <option value="LATE">Late</option>
                  </select>
                </label>

                <label className="attendance-form-field">
                  <span>Check In Time</span>
                  <input
                    type="time"
                    value={form.checkInTime}
                    onChange={(event) => setForm({
                      ...form,
                      checkInTime: event.target.value
                    })}
                  />
                </label>

                <label className="attendance-form-field">
                  <span>Check Out Time</span>
                  <input
                    type="time"
                    value={form.checkOutTime}
                    onChange={(event) => setForm({
                      ...form,
                      checkOutTime: event.target.value
                    })}
                  />
                </label>

                <label className="attendance-form-field full">
                  <span>Remarks</span>
                  <textarea
                    value={form.remarks}
                    maxLength={500}
                    rows={3}
                    placeholder="Add optional remarks (maximum 500 characters)"
                    onChange={(event) => setForm({
                      ...form,
                      remarks: event.target.value
                    })}
                  />
                  <small>{form.remarks.length}/500 characters</small>
                </label>
              </div>

              <div className="attendance-modal-footer">
                <button
                  type="button"
                  className="attendance-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="attendance-primary"
                  disabled={saving || employees.length === 0}
                >
                  <Save size={17} />
                  {saving ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance