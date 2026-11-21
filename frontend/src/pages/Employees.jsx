import { useCallback, useEffect, useState } from 'react'
import {
  Users, Search, RefreshCw, Plus, Pencil, Trash2, X, Save,
  ChevronLeft, ChevronRight, UserRound, Phone, CalendarDays,
  Building2, Mail, MapPin, Power, AlertCircle
} from 'lucide-react'
import api from '../services/api'
import './Employees.css'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  designation: '',
  phoneNumber: '',
  dateOfBirth: '',
  joiningDate: '',
  address: ''
}

function Employees({ isAdmin = false }) {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState(null)

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/employees/search', {
        params: {
          search: search.trim() || undefined,
          page,
          size: 10,
          sortBy: 'id',
          direction: 'asc'
        }
      })

      const data = response.data
      setEmployees(data.content || [])
      setTotalPages(data.totalPages || 0)
      setTotalElements(data.totalElements || 0)

      if (data.totalPages > 0 && page >= data.totalPages) {
        setPage(data.totalPages - 1)
      }
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view employees.'
          : 'Unable to load employees. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees, refreshKey])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await api.get('/api/departments')
        setDepartments(Array.isArray(response.data) ? response.data : [])
      } catch {
        setDepartments([])
      }
    }

    loadDepartments()
  }, [])

  const handleSearch = (value) => {
    setSearch(value)
    setPage(0)
  }

  const openAddModal = () => {
    setEditingEmployee(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (employee) => {
    setEditingEmployee(employee)
    setForm({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      department: employee.department || '',
      designation: employee.designation || '',
      phoneNumber: employee.phoneNumber || '',
      dateOfBirth: employee.dateOfBirth || '',
      joiningDate: employee.joiningDate || '',
      address: employee.address || ''
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingEmployee(null)
    setFormError('')
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value.trim()])
    )

    if (Object.values(payload).some((value) => !value)) {
      setFormError('Please complete all required fields.')
      return
    }

    if (payload.firstName.length > 50 || payload.lastName.length > 50) {
      setFormError('First name and last name cannot exceed 50 characters.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (!/^[0-9]{10}$/.test(payload.phoneNumber)) {
      setFormError('Phone number must contain exactly 10 digits.')
      return
    }

    if (payload.address.length > 500) {
      setFormError('Address cannot exceed 500 characters.')
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    if (payload.dateOfBirth >= today) {
      setFormError('Date of birth must be in the past.')
      return
    }

    if (payload.joiningDate > today) {
      setFormError('Joining date cannot be in the future.')
      return
    }

    setSaving(true)

    try {
      if (editingEmployee) {
        await api.put(`/api/employees/${editingEmployee.id}`, payload)
      } else {
        await api.post('/api/employees', payload)
      }

      setModalOpen(false)
      setEditingEmployee(null)
      setForm(emptyForm)
      setPage(0)
      setRefreshKey((current) => current + 1)
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message

      setFormError(
        status === 409
          ? message || 'An employee with these details already exists.'
          : status === 400
            ? message || 'Please check the employee details.'
            : status === 401 || status === 403
              ? 'You do not have permission to perform this action.'
              : 'Unable to save employee. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (employee) => {
    const nextStatus = !employee.active
    const confirmed = window.confirm(
      `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} ${employee.firstName} ${employee.lastName}?`
    )

    if (!confirmed) return

    setActionId(employee.id)
    setError('')

    try {
      await api.patch(`/api/employees/${employee.id}/status`, null, {
        params: { active: nextStatus }
      })
      setRefreshKey((current) => current + 1)
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You do not have permission to change employee status.'
          : 'Unable to update employee status.'
      )
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`
    )

    if (!confirmed) return

    setActionId(employee.id)
    setError('')

    try {
      await api.delete(`/api/employees/${employee.id}`)
      setRefreshKey((current) => current + 1)
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'Only an administrator can delete employees.'
          : 'Unable to delete employee. Please try again.'
      )
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="employees-page">
      <div className="employees-heading">
        <div>
          <h2>Employee Directory</h2>
          <p>Manage employee information, departments and employment status.</p>
        </div>

        <div className="employees-heading-actions">
          <div className="employees-total">
            <Users size={19} />
            <span>{totalElements} Employees</span>
          </div>
          <button className="employees-add" onClick={openAddModal}>
            <Plus size={17} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="employees-toolbar">
        <div className="employees-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />
          {search && (
            <button className="employees-clear-search" onClick={() => handleSearch('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <button
          className="employees-refresh"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? 'employees-spinning' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="employees-alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="employees-table-card">
        {loading ? (
          <div className="employees-message">Loading employees...</div>
        ) : employees.length === 0 ? (
          <div className="employees-empty">
            <div className="employees-empty-icon"><Users size={27} /></div>
            <strong>No employees found</strong>
            <span>{search ? 'Try a different search term.' : 'Add your first employee to get started.'}</span>
          </div>
        ) : (
          <div className="employees-table-scroll">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>CONTACT</th>
                  <th>DEPARTMENT</th>
                  <th>DESIGNATION</th>
                  <th>JOINING DATE</th>
                  <th>STATUS</th>
                  <th className="employees-actions-heading">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-initials">
                          {employee.firstName?.charAt(0)}{employee.lastName?.charAt(0)}
                        </div>
                        <div>
                          <strong>{employee.firstName} {employee.lastName}</strong>
                          <span>EMP-{String(employee.id).padStart(4, '0')}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="employee-contact">
                        <span><Mail size={13} />{employee.email}</span>
                        <span><Phone size={13} />{employee.phoneNumber || '—'}</span>
                      </div>
                    </td>
                    <td>{employee.department || '—'}</td>
                    <td>{employee.designation || '—'}</td>
                    <td>{employee.joiningDate || '—'}</td>
                    <td>
                      <span className={`employee-status ${employee.active ? 'active' : 'inactive'}`}>
                        {employee.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="employee-row-actions">
                        <button
                          className="employee-action edit"
                          title="Edit employee"
                          aria-label={`Edit ${employee.firstName}`}
                          onClick={() => openEditModal(employee)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className={`employee-action ${employee.active ? 'deactivate' : 'activate'}`}
                          title={employee.active ? 'Deactivate employee' : 'Activate employee'}
                          aria-label={employee.active ? 'Deactivate employee' : 'Activate employee'}
                          disabled={actionId === employee.id}
                          onClick={() => handleStatusChange(employee)}
                        >
                          <Power size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            className="employee-action delete"
                            title="Delete employee"
                            aria-label={`Delete ${employee.firstName}`}
                            disabled={actionId === employee.id}
                            onClick={() => handleDelete(employee)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="employees-pagination">
          <span>
            Showing {employees.length ? page * 10 + 1 : 0}–{page * 10 + employees.length} of {totalElements}
          </span>
          <div>
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            <span>Page {totalPages === 0 ? 0 : page + 1} of {totalPages}</span>
            <button
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="employees-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}>
          <div className="employees-modal" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
            <div className="employees-modal-header">
              <div>
                <h3 id="employee-modal-title">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <p>{editingEmployee ? 'Update employee information.' : 'Enter the employee details below.'}</p>
              </div>
              <button className="employees-modal-close" onClick={closeModal} aria-label="Close dialog">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="employees-form-grid">
                <label>
                  First name *
                  <input name="firstName" value={form.firstName} onChange={updateField} maxLength={50} required />
                </label>
                <label>
                  Last name *
                  <input name="lastName" value={form.lastName} onChange={updateField} maxLength={50} required />
                </label>
                <label className="employees-form-full">
                  Email address *
                  <input name="email" type="email" value={form.email} onChange={updateField} required />
                </label>
                <label>
                  Department *
                  <select name="department" value={form.department} onChange={updateField} required>
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.name}>{department.name}</option>
                    ))}
                    {form.department && !departments.some((item) => item.name === form.department) && (
                      <option value={form.department}>{form.department}</option>
                    )}
                  </select>
                </label>
                <label>
                  Designation *
                  <input name="designation" value={form.designation} onChange={updateField} required />
                </label>
                <label>
                  Phone number *
                  <input name="phoneNumber" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.phoneNumber} onChange={updateField} required />
                </label>
                <label>
                  Date of birth *
                  <input name="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={updateField} required />
                </label>
                <label>
                  Joining date *
                  <input name="joiningDate" type="date" max={new Date().toISOString().slice(0, 10)} value={form.joiningDate} onChange={updateField} required />
                </label>
                <label className="employees-form-full">
                  Address *
                  <textarea name="address" value={form.address} onChange={updateField} maxLength={500} rows={3} required />
                  <span className="employees-character-count">{form.address.length}/500</span>
                </label>
              </div>

              {formError && <div className="employees-form-error"><AlertCircle size={16} />{formError}</div>}

              <div className="employees-modal-footer">
                <button type="button" className="employees-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="employees-save" disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
