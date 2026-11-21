import { useEffect, useState } from 'react'
import {
  Building2,
  RefreshCw,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save
} from 'lucide-react'
import api from '../services/api'
import './Departments.css'

function Departments({ isAdmin = false }) {
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [formError, setFormError] = useState('')

  const loadDepartments = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/departments')
      setDepartments(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view departments.'
          : 'Unable to load departments. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const filteredDepartments = departments.filter((department) =>
    `${department.name} ${department.description || ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  )

  const openAddModal = () => {
    setEditingDepartment(null)
    setForm({ name: '', description: '' })
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (department) => {
    setEditingDepartment(department)
    setForm({
      name: department.name || '',
      description: department.description || ''
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingDepartment(null)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      setFormError('Department name is required.')
      return
    }

    if (name.length > 100) {
      setFormError('Department name cannot exceed 100 characters.')
      return
    }

    if (description.length > 500) {
      setFormError('Description cannot exceed 500 characters.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const payload = { name, description }

      if (editingDepartment) {
        await api.put(`/api/departments/${editingDepartment.id}`, payload)
      } else {
        await api.post('/api/departments', payload)
      }

      setModalOpen(false)
      setEditingDepartment(null)
      setForm({ name: '', description: '' })
      await loadDepartments()
    } catch (err) {
      const status = err.response?.status
      setFormError(
        status === 409
          ? 'A department with this name already exists.'
          : status === 400
            ? 'Please check the department details and try again.'
            : status === 401 || status === 403
              ? 'You do not have permission to perform this action.'
              : 'Unable to save department. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    )

    if (!confirmed) return

    setDeletingId(department.id)
    setError('')

    try {
      await api.delete(`/api/departments/${department.id}`)
      await loadDepartments()
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You do not have permission to delete this department.'
          : err.response?.status === 409
            ? 'This department cannot be deleted because it is currently in use.'
            : 'Unable to delete department. Please try again.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="departments-page">
      <div className="departments-heading">
        <div>
          <h2>Department Directory</h2>
          <p>View and manage your organization's departments.</p>
        </div>

        <div className="departments-heading-actions">
          <div className="departments-total">
            <Building2 size={19} />
            <span>{departments.length} Departments</span>
          </div>

          {isAdmin && (
            <button className="departments-add" onClick={openAddModal}>
              <Plus size={17} />
              Add Department
            </button>
          )}
        </div>
      </div>

      <div className="departments-toolbar">
        <div className="departments-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className="departments-refresh"
          onClick={loadDepartments}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? 'departments-spinning' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="departments-alert departments-error">{error}</div>
      )}

      {loading ? (
        <div className="departments-message">Loading departments...</div>
      ) : filteredDepartments.length === 0 ? (
        <div className="departments-message">
          {search ? 'No departments match your search.' : 'No departments found.'}
        </div>
      ) : (
        <div className="departments-grid">
          {filteredDepartments.map((department) => (
            <div className="department-card" key={department.id}>
              <div className="department-card-icon">
                <Building2 size={23} />
              </div>

              <div className="department-card-content">
                <span className="department-id">
                  DEPARTMENT #{department.id}
                </span>
                <h3>{department.name}</h3>
                <p>
                  {department.description || 'No description available.'}
                </p>
              </div>

              {isAdmin && (
                <div className="department-card-actions">
                  <button
                    type="button"
                    className="department-action-edit"
                    title="Edit department"
                    aria-label={`Edit ${department.name}`}
                    onClick={() => openEditModal(department)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    className="department-action-delete"
                    title="Delete department"
                    aria-label={`Delete ${department.name}`}
                    disabled={deletingId === department.id}
                    onClick={() => handleDelete(department)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="department-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal()
        }}>
          <div
            className="department-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-modal-title"
          >
            <div className="department-modal-header">
              <div>
                <h3 id="department-modal-title">
                  {editingDepartment ? 'Edit Department' : 'Add Department'}
                </h3>
                <p>
                  {editingDepartment
                    ? 'Update the department information.'
                    : 'Enter the details for the new department.'}
                </p>
              </div>
              <button
                type="button"
                className="department-modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="department-form-field">
                <label htmlFor="department-name">Department Name</label>
                <input
                  id="department-name"
                  type="text"
                  placeholder="e.g. Human Resources"
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  required
                  autoFocus
                />
                <span>{form.name.length}/100 characters</span>
              </div>

              <div className="department-form-field">
                <label htmlFor="department-description">Description</label>
                <textarea
                  id="department-description"
                  placeholder="Describe the department's responsibilities..."
                  rows={4}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value
                    }))
                  }
                />
                <span>{form.description.length}/500 characters</span>
              </div>

              {formError && (
                <div className="departments-alert departments-error">
                  {formError}
                </div>
              )}

              <div className="department-modal-actions">
                <button
                  type="button"
                  className="department-cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="department-save"
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving
                    ? 'Saving...'
                    : editingDepartment
                      ? 'Save Changes'
                      : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments