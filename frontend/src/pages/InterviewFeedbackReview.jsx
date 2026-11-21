import { useEffect, useState } from 'react'
import {
  RefreshCw, Search, MessageSquare, Star,
  CheckCircle2, Clock3, UserRound
} from 'lucide-react'
import api from '../services/api'
import './InterviewFeedbackReview.css'

function InterviewFeedbackReview() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const loadFeedback = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/interviews/feedback')
      setFeedback(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to load interview feedback.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  const filteredFeedback = feedback.filter((item) =>
    [
      item.candidateName,
      item.candidateEmail,
      item.jobTitle,
      item.interviewerName,
      item.recommendation,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const averageRating = (item) => {
    const ratings = [
      item.technicalRating,
      item.communicationRating,
      item.problemSolvingRating,
    ].filter((rating) => typeof rating === 'number')

    if (!ratings.length) return '—'

    return (
      ratings.reduce((total, rating) => total + rating, 0) /
      ratings.length
    ).toFixed(1)
  }

  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleString()
  }

  const getRecommendationClass = (recommendation) => {
    const value = recommendation?.toLowerCase()

    if (value === 'selected') return 'positive'
    if (value === 'rejected') return 'negative'
    return 'neutral'
  }

  return (
    <div className="feedback-review-page">
      <div className="feedback-review-header">
        <div>
          <h2>Interview Feedback</h2>
          <p>Review evaluations submitted by interviewers.</p>
        </div>

        <button
          className="feedback-refresh-btn"
          onClick={loadFeedback}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? 'feedback-spinning' : ''}
          />
          Refresh
        </button>
      </div>

      <div className="feedback-review-stats">
        <div className="feedback-review-stat">
          <span className="feedback-stat-icon">
            <MessageSquare size={21} />
          </span>
          <div>
            <p>Total Feedback</p>
            <h3>{feedback.length}</h3>
          </div>
        </div>

        <div className="feedback-review-stat">
          <span className="feedback-stat-icon">
            <CheckCircle2 size={21} />
          </span>
          <div>
            <p>Selected Recommendations</p>
            <h3>
              {feedback.filter(
                (item) => item.recommendation === 'SELECTED'
              ).length}
            </h3>
          </div>
        </div>

        <div className="feedback-review-stat">
          <span className="feedback-stat-icon">
            <Star size={21} />
          </span>
          <div>
            <p>Average Evaluation</p>
            <h3>
              {feedback.length
                ? (
                    feedback.reduce(
                      (total, item) =>
                        total + Number(averageRating(item) || 0),
                      0
                    ) / feedback.length
                  ).toFixed(1)
                : '—'}
              {feedback.length ? '/5' : ''}
            </h3>
          </div>
        </div>
      </div>

      {error && (
        <div className="feedback-review-alert">{error}</div>
      )}

      <div className="feedback-review-card">
        <div className="feedback-review-card-heading">
          <div>
            <h3>Submitted Evaluations</h3>
            <p>Candidate performance and interviewer recommendations.</p>
          </div>
        </div>

        <div className="feedback-review-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search candidate, position or interviewer..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="feedback-review-state">
            <RefreshCw size={22} className="feedback-spinning" />
            <p>Loading interview feedback...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="feedback-review-state">
            <MessageSquare size={32} />
            <h3>No feedback found</h3>
            <p>
              {feedback.length
                ? 'Try a different search term.'
                : 'Submitted interview evaluations will appear here.'}
            </p>
          </div>
        ) : (
          <div className="feedback-review-list">
            {filteredFeedback.map((item) => (
              <article
                className="feedback-review-item"
                key={item.id}
              >
                <div className="feedback-review-item-header">
                  <div className="feedback-candidate-info">
                    <span className="feedback-candidate-avatar">
                      {(item.candidateName || 'C')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                    <div>
                      <h3>{item.candidateName || 'Unknown Candidate'}</h3>
                      <p>{item.candidateEmail || '—'}</p>
                      <span>{item.jobTitle || '—'}</span>
                    </div>
                  </div>

                  <span
                    className={`feedback-recommendation ${getRecommendationClass(item.recommendation)}`}
                  >
                    {item.recommendation || 'NOT SPECIFIED'}
                  </span>
                </div>

                <div className="feedback-review-meta">
                  <span>
                    <UserRound size={15} />
                    Interviewer: {item.interviewerName || '—'}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {formatDate(item.submittedAt)}
                  </span>
                  <span>
                    Interview #{item.interviewId}
                  </span>
                </div>

                <div className="feedback-rating-grid">
                  <div>
                    <span>Technical</span>
                    <strong>{item.technicalRating ?? '—'}/5</strong>
                  </div>
                  <div>
                    <span>Communication</span>
                    <strong>{item.communicationRating ?? '—'}/5</strong>
                  </div>
                  <div>
                    <span>Problem Solving</span>
                    <strong>{item.problemSolvingRating ?? '—'}/5</strong>
                  </div>
                  <div className="feedback-average-rating">
                    <span>Average</span>
                    <strong>{averageRating(item)}/5</strong>
                  </div>
                </div>

                <div className="feedback-review-details">
                  <div>
                    <h4>Strengths</h4>
                    <p>{item.strengths || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4>Areas for Improvement</h4>
                    <p>{item.areasForImprovement || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4>Additional Comments</h4>
                    <p>{item.comments || 'No additional comments'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewFeedbackReview
