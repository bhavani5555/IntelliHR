
import { useEffect, useMemo, useState } from 'react'
import {
  Wallet, IndianRupee, CheckCircle2, Clock3,
  Search, RefreshCw, Plus, X, Play,
  CreditCard, Trash2, CalendarDays
} from 'lucide-react'
import api from '../services/api'
import './Payroll.css'

const currentDate = new Date()

const initialForm = {
  employeeId: '',
  salaryMonth: currentDate.getMonth() + 1,
  salaryYear: currentDate.getFullYear(),
  basicSalary: '',
  hra: '',
  otherAllowances: '0',
  deductions: '0',
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))

const monthNames = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
]

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('intellihr_user') || '{}')
  } catch {
    return {}
  }
}

function Payroll() {
  const currentUser = getStoredUser()
  const userRole = currentUser.role?.replace('ROLE_', '').toUpperCase()
  const isEmployee = userRole === 'EMPLOYEE'

  const [payrolls, setPayrolls] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [monthFilter, setMonthFilter] = useState('ALL')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      if (isEmployee) {
        const profileResponse = await api.get('/api/employees/me/profile')
        const employeeId = profileResponse.data.id

        const payrollResponse = await api.get(
          `/api/payroll/employee/${employeeId}`
        )

        setPayrolls(Array.isArray(payrollResponse.data) ? payrollResponse.data : [])
        setEmployees([])
      } else {
        const [payrollResponse, employeeResponse] = await Promise.all([
          api.get('/api/payroll'),
          api.get('/api/employees/search', {
            params: {
              page: 0,
              size: 100,
              sortBy: 'id',
              direction: 'asc',
            },
          }),
        ])

        setPayrolls(Array.isArray(payrollResponse.data) ? payrollResponse.data : [])
        setEmployees(
          (employeeResponse.data.content || []).filter(
            (employee) => employee.active
          )
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to access this payroll information.'
          : 'Unable to load payroll data. Please try again.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const matchesSearch = isEmployee
        ? String(item.id).includes(search)
        : (item.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
          String(item.employeeId).includes(search) ||
          String(item.id).includes(search)

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter

      const matchesMonth =
        monthFilter === 'ALL' ||
        item.salaryMonth === Number(monthFilter)

      const matchesYear =
        yearFilter === 'ALL' ||
        item.salaryYear === Number(yearFilter)

      return matchesSearch && matchesStatus && matchesMonth && matchesYear
    })
  }, [payrolls, search, statusFilter, monthFilter, yearFilter, isEmployee])

  const totals = useMemo(() => ({
    total: payrolls.length,
    paid: payrolls.filter((item) => item.status === 'PAID').length,
    processed: payrolls.filter((item) => item.status === 'PROCESSED').length,
    draft: payrolls.filter((item) => item.status === 'DRAFT').length,
    amount: payrolls
      .filter((item) => item.status === 'PAID')
      .reduce((sum, item) => sum + Number(item.netSalary || 0), 0),
  }), [payrolls])

  const basic = Number(form.basicSalary || 0)
  const hra = Number(form.hra || 0)
  const allowances = Number(form.otherAllowances || 0)
  const deductions = Number(form.deductions || 0)
  const gross = basic + hra + allowances
  const net = gross - deductions

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.employeeId) {
      setError('Please select an employee.')
      return
    }

    if (basic <= 0 || hra < 0 || allowances < 0 || deductions < 0) {
      setError('Please enter valid salary amounts.')
      return
    }

    if (deductions > gross) {
      setError('Deductions cannot exceed gross salary.')
      return
    }

    setSaving(true)

    try {
      await api.post('/api/payroll', {
        employeeId: Number(form.employeeId),
        salaryMonth: Number(form.salaryMonth),
        salaryYear: Number(form.salaryYear),
        basicSalary: basic,
        hra,
        otherAllowances: allowances,
        deductions,
      })

      setShowModal(false)
      setForm(initialForm)
      setSuccess('Payroll created successfully.')
      await loadData()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create payroll. Please check the entered details.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleAction = async (id, action) => {
    setError('')
    setSuccess('')

    const messages = {
      process: 'Payroll processed successfully.',
      pay: 'Payroll marked as paid successfully.',
      delete: 'Draft payroll deleted successfully.',
    }

    try {
      if (action === 'process') {
        await api.patch(`/api/payroll/${id}/process`)
      } else if (action === 'pay') {
        await api.patch(`/api/payroll/${id}/pay`)
      } else if (action === 'delete') {
        if (!window.confirm('Are you sure you want to delete this draft payroll?')) {
          return
        }
        await api.delete(`/api/payroll/${id}`)
      }

      setSuccess(messages[action])
      await loadData()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'The requested payroll action could not be completed.'
      )
    }
  }

  return (
    <div className="payroll-page">

      <div className="payroll-heading">
        <div>
          <h2>{isEmployee ? 'My Payroll' : 'Payroll Management'}</h2>
          <p>
            {isEmployee
              ? 'View your salary details, payroll history and payment status.'
              : 'Manage employee salaries, payroll processing and payments.'}
          </p>
        </div>

        {!isEmployee && (
          <button
            className="payroll-primary-button"
            onClick={() => {
              setError('')
              setSuccess('')
              setShowModal(true)
            }}
          >
            <Plus size={18} />
            Create Payroll
          </button>
        )}
      </div>

      {error && (
        <div className="payroll-feedback error">
          {error}
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      {success && (
        <div className="payroll-feedback success">
          {success}
          <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}

      <section className="payroll-stats">

        <article className="payroll-stat-card">
          <div className="payroll-stat-icon purple">
            <Wallet size={21} />
          </div>
          <span>Total Payroll Records</span>
          <h3>{totals.total}</h3>
          <small>{isEmployee ? 'Your salary records' : 'All salary records'}</small>
        </article>

        <article className="payroll-stat-card">
          <div className="payroll-stat-icon green">
            <IndianRupee size={21} />
          </div>
          <span>{isEmployee ? 'Total Salary Received' : 'Total Amount Paid'}</span>
          <h3>{formatCurrency(totals.amount)}</h3>
          <small>Based on paid payrolls</small>
        </article>

        <article className="payroll-stat-card">
          <div className="payroll-stat-icon blue">
            <CheckCircle2 size={21} />
          </div>
          <span>Paid Payrolls</span>
          <h3>{totals.paid}</h3>
          <small>Completed payments</small>
        </article>

        <article className="payroll-stat-card">
          <div className="payroll-stat-icon orange">
            <Clock3 size={21} />
          </div>
          <span>{isEmployee ? 'Awaiting Payment' : 'Pending Actions'}</span>
          <h3>{totals.draft + totals.processed}</h3>
          <small>{totals.draft} draft · {totals.processed} processed</small>
        </article>

      </section>

      <section className="payroll-content-card">

        <div className="payroll-section-heading">
          <div>
            <h3>{isEmployee ? 'My Salary Records' : 'Employee Payroll Records'}</h3>
            <p>
              {isEmployee
                ? 'Your monthly salary and payment history.'
                : 'View and manage monthly salary information.'}
            </p>
          </div>

          <button
            className="payroll-refresh"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="payroll-toolbar">

          <div className="payroll-search">
            <Search size={17} />
            <input
              placeholder={isEmployee ? 'Search payroll ID...' : 'Search employee or payroll ID...'}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PROCESSED">Processed</option>
            <option value="PAID">Paid</option>
          </select>

          <select
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          >
            <option value="ALL">All Months</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
          >
            <option value="ALL">All Years</option>
            {[...new Set([
              currentDate.getFullYear(),
              ...payrolls.map((item) => item.salaryYear),
            ])].sort((a, b) => b - a).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

        </div>

        <div className="payroll-table-scroll">

          {loading ? (
            <div className="payroll-message">Loading payroll records...</div>
          ) : error && payrolls.length === 0 ? (
            <div className="payroll-message">{error}</div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="payroll-message">
              No payroll records found.
            </div>
          ) : (
            <table className="payroll-table">
              <thead>
                <tr>
                  {!isEmployee && <th>EMPLOYEE</th>}
                  <th>PAYROLL ID</th>
                  <th>SALARY PERIOD</th>
                  <th>BASIC SALARY</th>
                  <th>GROSS SALARY</th>
                  <th>DEDUCTIONS</th>
                  <th>NET SALARY</th>
                  <th>STATUS</th>
                  {!isEmployee && <th>ACTIONS</th>}
                </tr>
              </thead>

              <tbody>
                {filteredPayrolls.map((item) => (
                  <tr key={item.id}>
                    {!isEmployee && (
                      <td>
                        <div className="payroll-employee">
                          <div className="payroll-avatar">
                            {item.employeeName?.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <strong>{item.employeeName}</strong>
                            <span>EMP-{item.employeeId}</span>
                          </div>
                        </div>
                      </td>
                    )}

                    <td>PAY-{item.id}</td>

                    <td>
                      {monthNames[item.salaryMonth - 1] || '—'} {item.salaryYear}
                    </td>

                    <td>{formatCurrency(item.basicSalary)}</td>
                    <td>{formatCurrency(item.grossSalary)}</td>
                    <td>{formatCurrency(item.deductions)}</td>
                    <td className="payroll-net">
                      {formatCurrency(item.netSalary)}
                    </td>

                    <td>
                      <span className={`payroll-status ${(item.status || '').toLowerCase()}`}>
                        {item.status || 'UNKNOWN'}
                      </span>
                    </td>

                    {!isEmployee && (
                      <td>
                        <div className="payroll-actions">
                          {item.status === 'DRAFT' && (
                            <>
                              <button
                                className="payroll-action process"
                                title="Process payroll"
                                onClick={() => handleAction(item.id, 'process')}
                              >
                                <Play size={15} />
                                Process
                              </button>

                              <button
                                className="payroll-action delete"
                                title="Delete draft"
                                onClick={() => handleAction(item.id, 'delete')}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}

                          {item.status === 'PROCESSED' && (
                            <button
                              className="payroll-action paid"
                              onClick={() => handleAction(item.id, 'pay')}
                            >
                              <CreditCard size={15} />
                              Mark Paid
                            </button>
                          )}

                          {item.status === 'PAID' && (
                            <span className="payroll-completed">
                              <CheckCircle2 size={15} />
                              Completed
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        <div className="payroll-table-footer">
          Showing {filteredPayrolls.length} of {payrolls.length} payroll records
        </div>

      </section>

      {showModal && !isEmployee && (
        <div
          className="payroll-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowModal(false)
          }}
        >
          <div className="payroll-modal">

            <div className="payroll-modal-header">
              <div>
                <h3>Create New Payroll</h3>
                <p>Enter employee salary details for a month.</p>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate}>

              <div className="payroll-form-grid">

                <label className="full">
                  Employee
                  <select
                    required
                    value={form.employeeId}
                    onChange={(event) => updateForm('employeeId', event.target.value)}
                  >
                    <option value="">Select an active employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} — EMP-{employee.id}
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <small>No active employees available.</small>
                  )}
                </label>

                <label>
                  Salary Month
                  <select
                    value={form.salaryMonth}
                    onChange={(event) => updateForm('salaryMonth', event.target.value)}
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Salary Year
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    required
                    value={form.salaryYear}
                    onChange={(event) => updateForm('salaryYear', event.target.value)}
                  />
                </label>

                <label>
                  Basic Salary (₹)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.basicSalary}
                    onChange={(event) => updateForm('basicSalary', event.target.value)}
                    placeholder="e.g. 40000"
                  />
                </label>

                <label>
                  HRA (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.hra}
                    onChange={(event) => updateForm('hra', event.target.value)}
                    placeholder="e.g. 12000"
                  />
                </label>

                <label>
                  Other Allowances (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.otherAllowances}
                    onChange={(event) => updateForm('otherAllowances', event.target.value)}
                  />
                </label>

                <label>
                  Deductions (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.deductions}
                    onChange={(event) => updateForm('deductions', event.target.value)}
                  />
                </label>

              </div>

              <div className="payroll-calculation">
                <div>
                  <span>Gross Salary</span>
                  <strong>{formatCurrency(gross)}</strong>
                </div>
                <div>
                  <span>Total Deductions</span>
                  <strong>{formatCurrency(deductions)}</strong>
                </div>
                <div className="net-preview">
                  <span>Net Salary</span>
                  <strong>{formatCurrency(net)}</strong>
                </div>
              </div>

              <div className="payroll-modal-actions">
                <button
                  type="button"
                  className="payroll-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="payroll-primary-button"
                  disabled={saving || employees.length === 0 || net < 0}
                >
                  <Plus size={17} />
                  {saving ? 'Creating...' : 'Create Payroll'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Payroll
