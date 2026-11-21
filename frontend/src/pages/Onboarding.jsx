
import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardCheck, Plus, RefreshCw, Search, Users,
  Clock3, CheckCircle2, AlertCircle, XCircle,
  Trash2, Ban, CalendarDays, UserRound
} from 'lucide-react'
import api from '../services/api'
import './Onboarding.css'

const today = () => {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().slice(0, 10)
}

const emptyForm = {
  employeeId: '',
  title: '',
  description: '',
  dueDate: today(),
}

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function Onboarding({ isManagementUser }) {
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [progress, setProgress] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadTasks = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get(
        isManagementUser
          ? '/api/onboarding/tasks'
          : '/api/onboarding/tasks/me'
      )
      setTasks(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view these onboarding tasks.'
          : 'Unable to load onboarding tasks. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadEmployees = async () => {
    try {
      const response = await api.get('/api/employees/search', {
        params: {
          page: 0,
          size: 100,
          sortBy: 'id',
          direction: 'asc',
          active: true,
        },
      })

      setEmployees(response.data.content || [])
    } catch {
      setError('Unable to load employees for task assignment.')
    }
  }

  const loadProgress = async (employeeId) => {
    if (!employeeId) {
      setProgress(null)
      return
    }

    setProgressLoading(true)

    try {
      const response = await api.get(
        `/api/onboarding/progress/${employeeId}`
      )
      setProgress(response.data)
    } catch {
      setProgress(null)
      setError('Unable to load employee onboarding progress.')
    } finally {
      setProgressLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()

    if (isManagementUser) {
      loadEmployees()
    }
  }, [isManagementUser])

  useEffect(() => {
    if (isManagementUser && selectedEmployeeId) {
      loadProgress(selectedEmployeeId)
    } else {
      setProgress(null)
    }
  }, [selectedEmployeeId, isManagementUser])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const searchText = search.trim().toLowerCase()

      const matchesSearch =
        !searchText ||
        task.title?.toLowerCase().includes(searchText) ||
        task.employeeName?.toLowerCase().includes(searchText) ||
        task.employeeEmail?.toLowerCase().includes(searchText)

      const matchesStatus =
        statusFilter === 'ALL' || task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tasks, search, statusFilter])

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'PENDING').length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    completed: tasks.filter((task) => task.status === 'COMPLETED').length,
  }), [tasks])

  const handleCreateTask = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await api.post('/api/onboarding/tasks', {
        employeeId: Number(form.employeeId),
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
      })

      setForm(emptyForm)
      setShowForm(false)
      setSuccess('Onboarding task created successfully.')
      await loadTasks()

      if (selectedEmployeeId) {
        await loadProgress(selectedEmployeeId)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create the onboarding task. Please check the details.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (task, status) => {
    setError('')
    setSuccess('')

    try {
      await api.patch(`/api/onboarding/tasks/${task.id}/status`, {
        status,
      })

      setSuccess('Task status updated successfully.')
      await loadTasks()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to update task status. Please try again.'
      )
    }
  }

  const handleCancelTask = async (task) => {
    if (!window.confirm(`Cancel "${task.title}"?`)) return

    setError('')
    setSuccess('')

    try {
      await api.patch(`/api/onboarding/tasks/${task.id}/cancel`)
      setSuccess('Onboarding task cancelled.')
      await loadTasks()

      if (selectedEmployeeId) {
        await loadProgress(selectedEmployeeId)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to cancel this task.'
      )
    }
  }

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}" permanently?`)) return

    setError('')
    setSuccess('')

    try {
      await api.delete(`/api/onboarding/tasks/${task.id}`)
      setSuccess('Pending task deleted successfully.')
      await loadTasks()

      if (selectedEmployeeId) {
        await loadProgress(selectedEmployeeId)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to delete this task.'
      )
    }
  }

  const formatDate = (value) => {
    if (!value) return '—'

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const isOverdue = (task) =>
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED' &&
    task.dueDate < today()

  return (
    <div className="onboarding-page">
      <div className="onboarding-heading">
        <div>
          <span className="onboarding-eyebrow">PEOPLE DEVELOPMENT</span>
          <h2>Onboarding</h2>
          <p>
            {isManagementUser
              ? 'Create and manage employee onboarding tasks.'
              : 'Track and complete your onboarding activities.'}
          </p>
        </div>

        <div className="onboarding-heading-actions">
          <button
            className="onboarding-refresh"
            onClick={loadTasks}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {isManagementUser && (
            <button
              className="onboarding-primary-btn"
              onClick={() => {
                setShowForm((previous) => !previous)
                setError('')
                setSuccess('')
              }}
            >
              <Plus size={17} />
              Create Task
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="onboarding-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss">×</button>
        </div>
      )}

      {success && (
        <div className="onboarding-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} aria-label="Dismiss">×</button>
        </div>
      )}

      {isManagementUser && showForm && (
        <section className="onboarding-form-card">
          <div className="onboarding-section-heading">
            <div>
              <h3>Create onboarding task</h3>
              <p>Assign a task to an active employee.</p>
            </div>
            <button
              className="onboarding-icon-btn"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleCreateTask}>
            <div className="onboarding-form-grid">
              <label>
                Employee <span>*</span>
                <select
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm({ ...form, employeeId: event.target.value })
                  }
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} — {employee.email}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Task title <span>*</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  maxLength={150}
                  placeholder="e.g. Complete company orientation"
                  required
                />
              </label>

              <label>
                Due date <span>*</span>
                <input
                  type="date"
                  min={today()}
                  value={form.dueDate}
                  onChange={(event) =>
                    setForm({ ...form, dueDate: event.target.value })
                  }
                  required
                />
              </label>

              <label className="onboarding-description-field">
                Description
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  maxLength={1000}
                  rows={3}
                  placeholder="Add instructions or details for this task..."
                />
              </label>
            </div>

            <div className="onboarding-form-actions">
              <button
                type="button"
                className="onboarding-secondary-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="onboarding-primary-btn"
                disabled={saving || employees.length === 0}
              >
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="onboarding-stats">
        <article className="onboarding-stat-card">
          <div className="onboarding-stat-icon purple">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <span>Total Tasks</span>
            <strong>{counts.total}</strong>
          </div>
        </article>

        <article className="onboarding-stat-card">
          <div className="onboarding-stat-icon orange">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{counts.pending}</strong>
          </div>
        </article>

        <article className="onboarding-stat-card">
          <div className="onboarding-stat-icon blue">
            <Users size={20} />
          </div>
          <div>
            <span>In Progress</span>
            <strong>{counts.inProgress}</strong>
          </div>
        </article>

        <article className="onboarding-stat-card">
          <div className="onboarding-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Completed</span>
            <strong>{counts.completed}</strong>
          </div>
        </article>
      </section>

      {isManagementUser && (
        <section className="onboarding-progress-card">
          <div className="onboarding-section-heading">
            <div>
              <h3>Employee Progress</h3>
              <p>View onboarding completion for an employee.</p>
            </div>
            <UserRound size={21} />
          </div>

          <select
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
          >
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} — {employee.email}
              </option>
            ))}
          </select>

          {progressLoading ? (
            <p className="onboarding-progress-message">Loading progress...</p>
          ) : progress ? (
            <div className="onboarding-progress-details">
              <div className="onboarding-progress-top">
                <strong>{progress.employeeName}</strong>
                <span>{Number(progress.completionPercentage).toFixed(2)}% complete</span>
              </div>

              <div className="onboarding-progress-track">
                <div
                  className="onboarding-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(progress.completionPercentage) || 0))}%`,
                  }}
                />
              </div>

              <div className="onboarding-progress-counts">
                <span>{progress.totalTasks} Total</span>
                <span>{progress.pendingTasks} Pending</span>
                <span>{progress.inProgressTasks} In Progress</span>
                <span>{progress.completedTasks} Completed</span>
              </div>
            </div>
          ) : (
            <p className="onboarding-progress-message">
              Select an employee to view their progress.
            </p>
          )}
        </section>
      )}

      <section className="onboarding-task-card">
        <div className="onboarding-section-heading">
          <div>
            <h3>{isManagementUser ? 'Onboarding Tasks' : 'My Onboarding Tasks'}</h3>
            <p>
              {isManagementUser
                ? 'Review and manage assigned onboarding activities.'
                : 'Your assigned tasks and their current status.'}
            </p>
          </div>
          <span className="onboarding-task-count">{filteredTasks.length} tasks</span>
        </div>

        <div className="onboarding-toolbar">
          <div className="onboarding-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isManagementUser ? 'Search tasks or employees...' : 'Search your tasks...'}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="onboarding-empty">Loading onboarding tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="onboarding-empty">
            <ClipboardCheck size={34} />
            <strong>No onboarding tasks found</strong>
            <span>
              {tasks.length === 0
                ? 'There are no onboarding tasks assigned yet.'
                : 'Try changing your search or status filter.'}
            </span>
          </div>
        ) : (
          <div className="onboarding-table-scroll">
            <table className="onboarding-table">
              <thead>
                <tr>
                  <th>TASK</th>
                  {isManagementUser && <th>EMPLOYEE</th>}
                  <th>DUE DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div className="onboarding-task-title">
                        <strong>{task.title}</strong>
                        {task.description && <span>{task.description}</span>}
                      </div>
                    </td>

                    {isManagementUser && (
                      <td>
                        <div className="onboarding-employee-cell">
                          <strong>{task.employeeName}</strong>
                          <span>{task.employeeEmail}</span>
                        </div>
                      </td>
                    )}

                    <td>
                      <div className={`onboarding-due-date ${isOverdue(task) ? 'overdue' : ''}`}>
                        <CalendarDays size={15} />
                        {formatDate(task.dueDate)}
                        {isOverdue(task) && <small>Overdue</small>}
                      </div>
                    </td>

                    <td>
                      <span className={`onboarding-status ${task.status?.toLowerCase()}`}>
                        {statusLabels[task.status] || task.status}
                      </span>
                    </td>

                    <td>
                      <div className="onboarding-row-actions">
                        {!isManagementUser && task.status === 'PENDING' && (
                          <button
                            className="onboarding-action-btn start"
                            onClick={() => handleStatusUpdate(task, 'IN_PROGRESS')}
                          >
                            Start
                          </button>
                        )}

                        {!isManagementUser && task.status === 'IN_PROGRESS' && (
                          <button
                            className="onboarding-action-btn complete"
                            onClick={() => handleStatusUpdate(task, 'COMPLETED')}
                          >
                            <CheckCircle2 size={14} />
                            Complete
                          </button>
                        )}

                        {isManagementUser && task.status !== 'COMPLETED' &&
                          task.status !== 'CANCELLED' && (
                            <button
                              className="onboarding-action-btn cancel"
                              onClick={() => handleCancelTask(task)}
                              title="Cancel task"
                            >
                              <Ban size={14} />
                              Cancel
                            </button>
                          )}

                        {isManagementUser && task.status === 'PENDING' && (
                          <button
                            className="onboarding-action-btn delete"
                            onClick={() => handleDeleteTask(task)}
                            title="Delete pending task"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}

                        {!isManagementUser &&
                          (task.status === 'COMPLETED' || task.status === 'CANCELLED') && (
                            <span className="onboarding-no-action">—</span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default Onboarding
