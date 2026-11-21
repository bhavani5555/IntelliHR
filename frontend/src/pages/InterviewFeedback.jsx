
import { useEffect, useState } from 'react'
import {
  MessageSquare, Star, CalendarDays, Clock3,
  CheckCircle2, AlertCircle, Send, RefreshCw
} from 'lucide-react'
import api from '../services/api'
import './InterviewFeedback.css'

const initialForm = {
  technicalRating: 3,
  communicationRating: 3,
  problemSolvingRating: 3,
  strengths: '',
  areasForImprovement: '',
  comments: '',
  recommendation: 'SELECTED',
}

function formatDate(dateValue) {
  if (!dateValue) return 'Not scheduled'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function InterviewFeedback() {
  const [interviews, setInterviews] = useState([])
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submittedIds, setSubmittedIds] = useState([])

  const loadInterviews = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/api/interviews/my')

      const completedInterviews = response.data.filter(
        (interview) => interview.status === 'COMPLETED'
      )

      setInterviews(completedInterviews)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load your interviews. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInterviews()
  }, [])

  const handleSelectInterview = (interview) => {
    setSelectedInterview(interview)
    setForm(initialForm)
    setError('')
    setSuccess('')
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleRatingChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedInterview) return

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const payload = {
        technicalRating: Number(form.technicalRating),
        communicationRating: Number(form.communicationRating),
        problemSolvingRating: Number(form.problemSolvingRating),
        strengths: form.strengths.trim(),
        areasForImprovement: form.areasForImprovement.trim(),
        comments: form.comments.trim(),
        recommendation: form.recommendation,
      }

      await api.post(
        `/api/interviews/${selectedInterview.id}/feedback`,
        payload
      )

      setSubmittedIds((previous) => [
        ...previous,
        selectedInterview.id,
      ])

      setSuccess('Interview feedback submitted successfully.')
      setSelectedInterview(null)
      setForm(initialForm)
    } catch (err) {
      const status = err.response?.status

      if (status === 409) {
        setError(
          'Feedback has already been submitted for this interview.'
        )
      } else {
        setError(
          err.response?.data?.message ||
          'Unable to submit feedback. Please try again.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderRating = (label, field) => (
    <div className="feedback-rating">
      <div className="feedback-rating-header">
        <label>{label}</label>
        <strong>{form[field]} / 5</strong>
      </div>

      <div className="feedback-stars">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={rating <= Number(form[field]) ? 'selected' : ''}
            onClick={() => handleRatingChange(field, rating)}
            aria-label={`${rating} out of 5`}
          >
            <Star size={23} fill="currentColor" />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="interview-feedback-page">
      <div className="feedback-page-header">
        <div>
          <span className="feedback-eyebrow">RECRUITMENT</span>
          <h1>Interview Feedback</h1>
          <p>
            Review your completed interviews and submit candidate feedback.
          </p>
        </div>

        <button
          className="feedback-refresh-button"
          onClick={loadInterviews}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="feedback-alert error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="feedback-alert success">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      <div className="feedback-content-grid">
        <section className="feedback-interview-section">
          <div className="feedback-section-heading">
            <div>
              <h2>Completed Interviews</h2>
              <p>
                {interviews.length} completed interview
                {interviews.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="feedback-empty-state">
              Loading your interviews...
            </div>
          ) : interviews.length === 0 ? (
            <div className="feedback-empty-state">
              <CalendarDays size={30} />
              <strong>No completed interviews</strong>
              <span>
                Completed interviews assigned to you will appear here.
              </span>
            </div>
          ) : (
            <div className="feedback-interview-list">
              {interviews.map((interview) => {
                const submitted = submittedIds.includes(interview.id)

                return (
                  <article
                    className={`feedback-interview-card ${
                      selectedInterview?.id === interview.id
                        ? 'active'
                        : ''
                    }`}
                    key={interview.id}
                  >
                    <div className="feedback-interview-card-top">
                      <div className="feedback-candidate-avatar">
                        {(interview.candidateName || 'C')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="feedback-completed-badge">
                        <CheckCircle2 size={13} />
                        Completed
                      </span>
                    </div>

                    <h3>{interview.candidateName}</h3>
                    <p className="feedback-job-title">
                      {interview.jobTitle}
                    </p>

                    <div className="feedback-interview-meta">
                      <span>
                        <MessageSquare size={14} />
                        {interview.round}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(interview.scheduledAt)}
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {interview.durationMinutes} minutes
                      </span>
                    </div>

                    {submitted ? (
                      <div className="feedback-submitted-label">
                        <CheckCircle2 size={16} />
                        Feedback submitted
                      </div>
                    ) : (
                      <button
                        className="feedback-select-button"
                        onClick={() => handleSelectInterview(interview)}
                      >
                        Submit Feedback
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="feedback-form-section">
          {!selectedInterview ? (
            <div className="feedback-form-placeholder">
              <div className="feedback-placeholder-icon">
                <MessageSquare size={28} />
              </div>
              <h2>Interview Evaluation</h2>
              <p>
                Select a completed interview to evaluate the candidate
                and submit your feedback.
              </p>
            </div>
          ) : (
            <form
              className="feedback-form"
              onSubmit={handleSubmit}
            >
              <div className="feedback-form-heading">
                <div>
                  <span className="feedback-eyebrow">
                    CANDIDATE EVALUATION
                  </span>
                  <h2>{selectedInterview.candidateName}</h2>
                  <p>{selectedInterview.jobTitle}</p>
                </div>
              </div>

              <div className="feedback-rating-group">
                {renderRating('Technical Skills', 'technicalRating')}
                {renderRating('Communication', 'communicationRating')}
                {renderRating('Problem Solving', 'problemSolvingRating')}
              </div>

              <div className="feedback-field">
                <label htmlFor="strengths">Strengths</label>
                <textarea
                  id="strengths"
                  name="strengths"
                  value={form.strengths}
                  onChange={handleFormChange}
                  placeholder="Describe the candidate's strengths..."
                  maxLength={2000}
                  rows={3}
                  required
                />
              </div>

              <div className="feedback-field">
                <label htmlFor="areasForImprovement">
                  Areas for Improvement
                </label>
                <textarea
                  id="areasForImprovement"
                  name="areasForImprovement"
                  value={form.areasForImprovement}
                  onChange={handleFormChange}
                  placeholder="Mention areas where the candidate can improve..."
                  maxLength={2000}
                  rows={3}
                  required
                />
              </div>

              <div className="feedback-field">
                <label htmlFor="comments">Additional Comments</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={form.comments}
                  onChange={handleFormChange}
                  placeholder="Add your overall interview observations..."
                  maxLength={3000}
                  rows={3}
                  required
                />
              </div>

              <div className="feedback-field">
                <label htmlFor="recommendation">
                  Final Recommendation
                </label>
                <select
                  id="recommendation"
                  name="recommendation"
                  value={form.recommendation}
                  onChange={handleFormChange}
                  required
                >
                  <option value="SELECTED">Selected</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              <div className="feedback-form-actions">
                <button
                  type="button"
                  className="feedback-cancel-button"
                  onClick={() => {
                    setSelectedInterview(null)
                    setForm(initialForm)
                    setError('')
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="feedback-submit-button"
                  disabled={submitting}
                >
                  <Send size={16} />
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export default InterviewFeedback
