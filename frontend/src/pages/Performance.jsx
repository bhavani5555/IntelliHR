
import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Search, RefreshCw, Star, FileText,
  Clock3, CheckCircle2, Send, MessageSquare,
  X, ChevronDown, Eye, ClipboardList
} from 'lucide-react'
import api from '../services/api'
import './Performance.css'

const initialForm = {
  employeeId: '',
  reviewerId: '',
  reviewPeriod: '',
  overallRating: 3,
  strengths: '',
  areasForImprovement: '',
  goals: '',
  feedback: '',
}

const statusLabels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  ACKNOWLEDGED: 'Acknowledged',
}

function Performance() {
  const [reviews, setReviews] = useState([])
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(initialForm)
  const [remarks, setRemarks] = useState('')
  const [selectedReview, setSelectedReview] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showRemarks, setShowRemarks] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('intellihr_user') || 'null')
    } catch {
      return null
    }
  }, [])

  const role = user?.role?.replace('ROLE_', '').toUpperCase()
  const isManagement = ['ADMIN', 'HR'].includes(role)

  const loadReviews = async () => {
    setLoading(true)
    setError('')

    try {
      let response

      if (isManagement) {
        response = await api.get('/api/performance-reviews')
      } else {
         // Fetch only the authenticated employee's own profile.
        const employeeResponse = await api.get('/api/employees/me/profile')
        const employee = employeeResponse.data

        if (!employee) {
          setReviews([])
          setError('Your employee profile could not be found.')
          return
        }

        response = await api.get(
          `/api/performance-reviews/employee/${employee.id}`
        )
      }

      setReviews(response.data || [])
    } catch (err) {
      setError(
        err.response?.status === 401 || err.response?.status === 403
          ? 'You are not authorized to view these reviews.'
          : 'Unable to load performance reviews. Please try again.'
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
          sortBy: 'firstName',
          direction: 'asc',
          active: true,
        },
      })

      setEmployees(response.data.content || [])
    } catch {
      setMessage('Unable to load employees for the review form.')
    }
  }

  useEffect(() => {
    loadReviews()

    if (isManagement) {
      loadEmployees()
    }
  }, [])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleCreateReview = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      await api.post('/api/performance-reviews', {
        ...form,
        employeeId: Number(form.employeeId),
        reviewerId: Number(form.reviewerId),
        overallRating: Number(form.overallRating),
      })

      setMessage('Performance review created successfully.')
      setForm(initialForm)
      setShowForm(false)
      await loadReviews()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to create performance review. Please check the details.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async (id) => {
    setError('')
    setMessage('')

    try {
      await api.patch(`/api/performance-reviews/${id}/submit`)
      setMessage('Review submitted successfully.')
      await loadReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit review.')
    }
  }

  const openRemarks = (review) => {
    setSelectedReview(review)
    setRemarks(review.employeeRemarks || '')
    setShowRemarks(true)
  }

  const handleAcknowledge = async (event) => {
    event.preventDefault()
    if (!selectedReview) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await api.patch(
        `/api/performance-reviews/${selectedReview.id}/acknowledge`,
        { employeeRemarks: remarks }
      )

      setMessage('Performance review acknowledged successfully.')
      setShowRemarks(false)
      setSelectedReview(null)
      setRemarks('')
      await loadReviews()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to acknowledge review.')
    } finally {
      setSaving(false)
    }
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus =
      filter === 'ALL' || review.status === filter

    const query = search.trim().toLowerCase()
    const matchesSearch =
      !query ||
      review.employeeName?.toLowerCase().includes(query) ||
      review.reviewerName?.toLowerCase().includes(query) ||
      review.reviewPeriod?.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })

  const counts = {
    total: reviews.length,
    draft: reviews.filter((item) => item.status === 'DRAFT').length,
    submitted: reviews.filter((item) => item.status === 'SUBMITTED').length,
    acknowledged: reviews.filter((item) => item.status === 'ACKNOWLEDGED').length,
  }

  const formatDate = (value) => {
    if (!value) return '—'

    return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="performance-page">
      <div className="performance-heading">
        <div>
          <span className="performance-eyebrow">PEOPLE DEVELOPMENT</span>
          <h2>Performance Management</h2>
          <p>Track employee performance, reviews and professional growth.</p>
        </div>

        <div className="performance-heading-actions">
          <button
            className="performance-refresh"
            onClick={loadReviews}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          {isManagement && (
            <button
              className="performance-primary"
              onClick={() => {
                setError('')
                setMessage('')
                setShowForm(true)
              }}
            >
              <Plus size={18} />
              Create Review
            </button>
          )}
        </div>
      </div>

      {error && <div className="performance-alert error">{error}</div>}
      {message && <div className="performance-alert success">{message}</div>}

      <div className="performance-stats">
        <article className="performance-stat-card">
          <div className="performance-stat-icon purple">
            <FileText size={21} />
          </div>
          <span>Total Reviews</span>
          <strong>{counts.total}</strong>
        </article>

        <article className="performance-stat-card">
          <div className="performance-stat-icon orange">
            <Clock3 size={21} />
          </div>
          <span>Draft</span>
          <strong>{counts.draft}</strong>
        </article>

        <article className="performance-stat-card">
          <div className="performance-stat-icon blue">
            <Send size={21} />
          </div>
          <span>Submitted</span>
          <strong>{counts.submitted}</strong>
        </article>

        <article className="performance-stat-card">
          <div className="performance-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <span>Acknowledged</span>
          <strong>{counts.acknowledged}</strong>
        </article>
      </div>

      <section className="performance-list-card">
        <div className="performance-list-heading">
          <div>
            <h3>Performance Reviews</h3>
            <p>Review records and their current progress.</p>
          </div>
          <span className="performance-total">{filteredReviews.length} reviews</span>
        </div>

        <div className="performance-toolbar">
          <div className="performance-search">
            <Search size={17} />
            <input
              placeholder="Search employee, reviewer or period..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="performance-filter">
            <ClipboardList size={16} />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
            </select>
            <ChevronDown size={15} />
          </div>
        </div>

        {loading ? (
          <div className="performance-empty">Loading performance reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="performance-empty">
            <FileText size={32} />
            <strong>No performance reviews found</strong>
            <span>
              {reviews.length === 0
                ? 'Create a review to get started.'
                : 'Try changing your search or status filter.'}
            </span>
          </div>
        ) : (
          <div className="performance-table-scroll">
            <table className="performance-table">
              <thead>
                <tr>
                  {isManagement && <th>EMPLOYEE</th>}
                  <th>REVIEW PERIOD</th>
                  {isManagement && <th>REVIEWER</th>}
                  <th>RATING</th>
                  <th>REVIEW DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    {isManagement && (
                      <td>
                        <strong>{review.employeeName}</strong>
                        <span className="performance-subtext">
                          EMP-{review.employeeId}
                        </span>
                      </td>
                    )}

                    <td>{review.reviewPeriod}</td>

                    {isManagement && <td>{review.reviewerName}</td>}

                    <td>
                      <span className="performance-rating">
                        <Star size={15} fill="currentColor" />
                        {review.overallRating}/5
                      </span>
                    </td>

                    <td>{formatDate(review.reviewDate)}</td>

                    <td>
                      <span className={`performance-status ${review.status?.toLowerCase()}`}>
                        {statusLabels[review.status] || review.status}
                      </span>
                    </td>

                    <td>
                      <div className="performance-row-actions">
                        <button
                          className="performance-view"
                          title="View review details"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye size={16} />
                        </button>

                        {isManagement && review.status === 'DRAFT' && (
                          <button
                            className="performance-submit"
                            title="Submit review"
                            onClick={() => handleSubmitReview(review.id)}
                          >
                            <Send size={15} />
                          </button>
                        )}

                        {!isManagement && review.status === 'SUBMITTED' && (
                          <button
                            className="performance-acknowledge"
                            onClick={() => openRemarks(review)}
                          >
                            Acknowledge
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
      </section>

      {showForm && (
        <div className="performance-modal-backdrop">
          <section className="performance-modal">
            <div className="performance-modal-header">
              <div>
                <h3>Create Performance Review</h3>
                <p>Enter the employee's performance assessment.</p>
              </div>
              <button
                className="performance-modal-close"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateReview}>
              <div className="performance-form-grid">
                <label>
                  Employee *
                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={updateForm}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} — {employee.department}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Reviewer *
                  <select
                    name="reviewerId"
                    value={form.reviewerId}
                    onChange={updateForm}
                    required
                  >
                    <option value="">Select reviewer</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Review Period *
                  <input
                    name="reviewPeriod"
                    value={form.reviewPeriod}
                    onChange={updateForm}
                    placeholder="e.g. Q4 2026"
                    maxLength={50}
                    required
                  />
                </label>

                <label>
                  Overall Rating *
                  <select
                    name="overallRating"
                    value={form.overallRating}
                    onChange={updateForm}
                    required
                  >
                    <option value={1}>1 — Needs improvement</option>
                    <option value={2}>2 — Below expectations</option>
                    <option value={3}>3 — Meets expectations</option>
                    <option value={4}>4 — Exceeds expectations</option>
                    <option value={5}>5 — Outstanding</option>
                  </select>
                </label>

                <label className="full-width">
                  Strengths
                  <textarea
                    name="strengths"
                    value={form.strengths}
                    onChange={updateForm}
                    maxLength={2000}
                    rows={3}
                    placeholder="Describe the employee's key strengths..."
                  />
                </label>

                <label className="full-width">
                  Areas for Improvement
                  <textarea
                    name="areasForImprovement"
                    value={form.areasForImprovement}
                    onChange={updateForm}
                    maxLength={2000}
                    rows={3}
                    placeholder="Identify areas where the employee can improve..."
                  />
                </label>

                <label className="full-width">
                  Goals
                  <textarea
                    name="goals"
                    value={form.goals}
                    onChange={updateForm}
                    maxLength={2000}
                    rows={3}
                    placeholder="Set goals for the next review period..."
                  />
                </label>

                <label className="full-width">
                  Feedback
                  <textarea
                    name="feedback"
                    value={form.feedback}
                    onChange={updateForm}
                    maxLength={2000}
                    rows={3}
                    placeholder="Add detailed performance feedback..."
                  />
                </label>
              </div>

              <div className="performance-form-actions">
                <button
                  type="button"
                  className="performance-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="performance-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Review'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedReview && !showRemarks && (
        <div className="performance-modal-backdrop">
          <section className="performance-modal performance-detail-modal">
            <div className="performance-modal-header">
              <div>
                <h3>Performance Review Details</h3>
                <p>{selectedReview.employeeName} · {selectedReview.reviewPeriod}</p>
              </div>
              <button
                className="performance-modal-close"
                onClick={() => setSelectedReview(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="performance-detail-grid">
              <div>
                <span>Employee</span>
                <strong>{selectedReview.employeeName}</strong>
              </div>
              <div>
                <span>Reviewer</span>
                <strong>{selectedReview.reviewerName}</strong>
              </div>
              <div>
                <span>Rating</span>
                <strong>{selectedReview.overallRating}/5</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{statusLabels[selectedReview.status]}</strong>
              </div>
              <div>
                <span>Review Date</span>
                <strong>{formatDate(selectedReview.reviewDate)}</strong>
              </div>
              <div className="full-width">
                <span>Strengths</span>
                <p>{selectedReview.strengths || 'No strengths recorded.'}</p>
              </div>
              <div className="full-width">
                <span>Areas for Improvement</span>
                <p>{selectedReview.areasForImprovement || 'No improvement areas recorded.'}</p>
              </div>
              <div className="full-width">
                <span>Goals</span>
                <p>{selectedReview.goals || 'No goals recorded.'}</p>
              </div>
              <div className="full-width">
                <span>Feedback</span>
                <p>{selectedReview.feedback || 'No feedback recorded.'}</p>
              </div>
              <div className="full-width">
                <span>Employee Remarks</span>
                <p>{selectedReview.employeeRemarks || 'No employee remarks yet.'}</p>
              </div>
            </div>

            <div className="performance-form-actions">
              <button
                className="performance-cancel"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {showRemarks && selectedReview && (
        <div className="performance-modal-backdrop">
          <section className="performance-modal performance-remarks-modal">
            <div className="performance-modal-header">
              <div>
                <h3>Acknowledge Review</h3>
                <p>Review and add your remarks before acknowledging.</p>
              </div>
              <button
                className="performance-modal-close"
                onClick={() => {
                  setShowRemarks(false)
                  setSelectedReview(null)
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="performance-ack-summary">
              <strong>{selectedReview.reviewPeriod}</strong>
              <span>{selectedReview.overallRating}/5 rating</span>
              <p>{selectedReview.feedback || 'No additional feedback provided.'}</p>
            </div>

            <form onSubmit={handleAcknowledge}>
              <label>
                Employee Remarks
                <textarea
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  maxLength={1000}
                  rows={5}
                  placeholder="Add your comments or acknowledgement remarks..."
                />
              </label>

              <div className="performance-form-actions">
                <button
                  type="button"
                  className="performance-cancel"
                  onClick={() => {
                    setShowRemarks(false)
                    setSelectedReview(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="performance-primary"
                  disabled={saving}
                >
                  {saving ? 'Submitting...' : 'Confirm Acknowledgement'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Performance
