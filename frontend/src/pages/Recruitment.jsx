
import { useEffect, useState } from 'react'
import {
  BriefcaseBusiness, Users, FileText, CalendarDays,
  RefreshCw, Plus, Search, X, Trash2, Eye,
  TrendingUp, ScanSearch
} from 'lucide-react'
import api from '../services/api'
import './Recruitment.css'

const sections = [
  'Overview',
  'Job Openings',
  'Applications',
  'Interviews',
  'Interview Questions',
  'Feedback',
]

const jobStatuses = ['OPEN', 'CLOSED', 'ON_HOLD', 'CANCELLED']

const applicationStatuses = [
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'SELECTED',
  'REJECTED',
  'WITHDRAWN',
]

const interviewStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED']

const initialJob = {
  title: '',
  department: '',
  description: '',
  requiredSkills: '',
  numberOfVacancies: 1,
  employmentType: 'FULL_TIME',
  location: '',
  minimumSalary: '',
  maximumSalary: '',
  applicationDeadline: '',
}

const initialInterview = {
  jobApplicationId: '',
  interviewerId: '',
  round: 'TECHNICAL',
  scheduledAt: '',
  durationMinutes: 60,
  mode: 'ONLINE',
  meetingLink: '',
  location: '',
  notes: '',
}

function Recruitment() {
  const [activeSection, setActiveSection] = useState('Overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modal, setModal] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [analytics, setAnalytics] = useState({
    pipeline: null,
    jobs: null,
    interviews: null,
    candidates: null,
    departments: [],
  })

  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [interviews, setInterviews] = useState([])
  const [feedbackList, setFeedbackList] = useState([])

  const [jobForm, setJobForm] = useState(initialJob)
  const [interviewForm, setInterviewForm] = useState(initialInterview)

  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [screeningResult, setScreeningResult] = useState(null)
  const [screeningLoadingId, setScreeningLoadingId] = useState(null)
  const [resumePreviewUrl, setResumePreviewUrl] = useState('')
  const [resumePreviewName, setResumePreviewName] = useState('')
  const [resumeLoadingId, setResumeLoadingId] = useState(null)

  const [interviewQuestions, setInterviewQuestions] = useState([])
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    jobRole: 'Java Developer',
    skill: 'Spring Boot',
    difficulty: 'MEDIUM',
    questionType: 'TECHNICAL',
    numberOfQuestions: 5,
  })

  useEffect(() => {
    loadSection()
  }, [activeSection])

  const showSuccess = (message) => {
    setSuccess(message)
    setError('')
    setTimeout(() => setSuccess(''), 3500)
  }

  const handleError = (err) => {
    console.error(err)
    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Something went wrong. Please try again.'
    )
    setSuccess('')
  }

  const loadSection = async () => {
    setLoading(true)
    setError('')

    try {
      if (activeSection === 'Overview') {
        await loadAnalytics()
      } else if (activeSection === 'Job Openings') {
        const response = await api.get('/api/job-openings')
        setJobs(Array.isArray(response.data) ? response.data : [])
      } else if (activeSection === 'Applications') {
        const response = await api.get('/api/job-applications')
        setApplications(Array.isArray(response.data) ? response.data : [])
      } else if (activeSection === 'Interviews') {
        const response = await api.get('/api/interviews')
        setInterviews(Array.isArray(response.data) ? response.data : [])
      } else if (activeSection === 'Interview Questions') {
        const response = await api.get('/api/recruitment/interview-questions')
        setInterviewQuestions(Array.isArray(response.data) ? response.data : [])
      } else if (activeSection === 'Feedback') {
        const response = await api.get('/api/interviews/feedback')
        setFeedbackList(Array.isArray(response.data) ? response.data : [])
      }
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    const endpoints = [
      '/api/recruitment-analytics/pipeline',
      '/api/recruitment-analytics/job-openings',
      '/api/recruitment-analytics/interviews',
      '/api/recruitment-analytics/candidates',
      '/api/recruitment-analytics/departments',
    ]

    const results = await Promise.allSettled(
      endpoints.map((endpoint) => api.get(endpoint))
    )

    const values = results.map((result) =>
      result.status === 'fulfilled' ? result.value.data : null
    )

    setAnalytics({
      pipeline: values[0],
      jobs: values[1],
      interviews: values[2],
      candidates: values[3],
      departments: Array.isArray(values[4]) ? values[4] : [],
    })

    if (results.every((result) => result.status === 'rejected')) {
      throw new Error('Unable to load recruitment analytics.')
    }
  }

  const openModal = (type) => {
    setError('')
    setSuccess('')
    setModal(type)
  }

  const closeModal = () => {
    setModal('')
    setSelectedApplication(null)
    setSelectedInterview(null)
  }

  const handleJobSubmit = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        ...jobForm,
        numberOfVacancies: Number(jobForm.numberOfVacancies),
        minimumSalary: jobForm.minimumSalary
          ? Number(jobForm.minimumSalary)
          : null,
        maximumSalary: jobForm.maximumSalary
          ? Number(jobForm.maximumSalary)
          : null,
        requiredSkills: jobForm.requiredSkills.trim(),
      }

      await api.post('/api/job-openings', payload)
      closeModal()
      setJobForm(initialJob)
      showSuccess('Job opening created successfully.')
      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  const handleInterviewSubmit = async (event) => {
    event.preventDefault()

    try {
      const payload = {
        ...interviewForm,
        jobApplicationId: Number(interviewForm.jobApplicationId),
        interviewerId: Number(interviewForm.interviewerId),
        durationMinutes: Number(interviewForm.durationMinutes),
        scheduledAt: interviewForm.scheduledAt,
      }

      await api.post('/api/interviews', payload)
      closeModal()
      setInterviewForm(initialInterview)
      showSuccess('Interview scheduled successfully.')
      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  const updateJobStatus = async (id, status) => {
    try {
      await api.patch(`/api/job-openings/${id}/status`, { status })
      showSuccess('Job status updated.')
      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  const updateApplicationStatus = async (id, status) => {
    try {
      await api.patch(`/api/job-applications/${id}/status`, null, {
        params: { status },
      })
      showSuccess('Application status updated.')
      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  // Updated: cancellation reason is required when status is CANCELLED.
  const updateInterviewStatus = async (
    id,
    status,
    cancellationReason = ''
  ) => {
    if (status === 'CANCELLED' && !cancellationReason.trim()) {
      setError('Please enter a cancellation reason.')
      return
    }

    try {
      await api.patch(`/api/interviews/${id}/status`, {
        status,
        cancellationReason:
          status === 'CANCELLED' ? cancellationReason.trim() : null,
      })

      closeModal()

      showSuccess(
        status === 'CANCELLED'
          ? 'Interview cancelled successfully.'
          : 'Interview status updated.'
      )

      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  const deleteRecord = async (endpoint, id, label) => {
    if (!window.confirm(`Are you sure you want to delete this ${label}?`)) {
      return
    }

    try {
      await api.delete(`${endpoint}/${id}`)
      showSuccess(`${label} deleted successfully.`)
      loadSection()
    } catch (err) {
      handleError(err)
    }
  }

  const viewApplicationResume = async (application) => {
    setResumeLoadingId(application.id)

    try {
      const response = await api.get(
        `/api/job-applications/${application.id}/resume`,
        { responseType: 'blob' }
      )

      const url = URL.createObjectURL(response.data)
      setResumePreviewUrl(url)
      setResumePreviewName(`${application.candidateName} - Resume.pdf`)
      setError('')
    } catch (err) {
      handleError(err)
    } finally {
      setResumeLoadingId(null)
    }
  }

  const downloadApplicationResume = async (application) => {
    setResumeLoadingId(application.id)

    try {
      const response = await api.get(
        `/api/job-applications/${application.id}/resume`,
        { responseType: 'blob' }
      )

      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${application.candidateName} - Resume.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setError('')
    } catch (err) {
      handleError(err)
    } finally {
      setResumeLoadingId(null)
    }
  }

  const screenResume = async (applicationId) => {
    setScreeningLoadingId(applicationId)

    try {
      const response = await api.post(
        `/api/recruitment/screening/${applicationId}`
      )
      setScreeningResult(response.data)
      setError('')
    } catch (err) {
      handleError(err)
    } finally {
      setScreeningLoadingId(null)
    }
  }

  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.department} ${job.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const filteredApplications = applications.filter((application) =>
    `${application.candidateName} ${application.jobTitle} ${application.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const filteredInterviews = interviews.filter((interview) =>
    `${interview.candidateName} ${interview.jobTitle} ${interview.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )


  const filteredFeedback = feedbackList.filter((feedback) =>
    `${feedback.candidateName} ${feedback.candidateEmail} ${feedback.jobTitle} ${feedback.interviewerName} ${feedback.recommendation}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  const formatDate = (date) => {
    if (!date) return 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
    return new Date(date).toLocaleDateString()
  }

  const formatDateTime = (date) => {
    if (!date) return 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'
    return new Date(date).toLocaleString()
  }

  const StatCard = ({ label, value, icon: Icon }) => (
    <div className="recruitment-stat-card">
      <div>
        <p>{label}</p>
        <h2>{value ?? 0}</h2>
      </div>
      <span className="recruitment-stat-icon">
        <Icon size={22} />
      </span>
    </div>
  )

  const renderOverview = () => (
    <>
      <div className="recruitment-stats-grid">
        <StatCard
          label="Total Job Openings"
          value={analytics.jobs?.totalJobs}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Total Candidates"
          value={analytics.candidates?.totalCandidates}
          icon={Users}
        />
        <StatCard
          label="Total Applications"
          value={analytics.pipeline?.totalApplications}
          icon={FileText}
        />
        <StatCard
          label="Total Interviews"
          value={analytics.interviews?.totalInterviews}
          icon={CalendarDays}
        />
      </div>

      <div className="recruitment-overview-grid">
        <div className="recruitment-card">
          <h3><TrendingUp size={19} /> Application Pipeline</h3>
          {analytics.pipeline ? (
            <div className="recruitment-pipeline-list">
              {[
                ['Applied', analytics.pipeline.applied],
                ['Under Review', analytics.pipeline.underReview],
                ['Shortlisted', analytics.pipeline.shortlisted],
                ['Interview Scheduled', analytics.pipeline.interviewScheduled],
                ['Selected', analytics.pipeline.selected],
                ['Rejected', analytics.pipeline.rejected],
                ['Withdrawn', analytics.pipeline.withdrawn],
              ].map(([label, value]) => (
                <div className="recruitment-pipeline-row" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? 0}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="recruitment-empty">No pipeline data available.</p>
          )}
        </div>

        <div className="recruitment-card">
          <h3><BriefcaseBusiness size={19} /> Job Opening Statistics</h3>
          {analytics.jobs ? (
            <div className="recruitment-pipeline-list">
              {[
                ['Open', analytics.jobs.openJobs],
                ['Closed', analytics.jobs.closedJobs],
                ['On Hold', analytics.jobs.onHoldJobs],
                ['Cancelled', analytics.jobs.cancelledJobs],
              ].map(([label, value]) => (
                <div className="recruitment-pipeline-row" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? 0}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="recruitment-empty">No job statistics available.</p>
          )}
        </div>

        <div className="recruitment-card">
          <h3><CalendarDays size={19} /> Interview Statistics</h3>
          {analytics.interviews ? (
            <div className="recruitment-pipeline-list">
              {[
                ['Scheduled', analytics.interviews.scheduledInterviews],
                ['Completed', analytics.interviews.completedInterviews],
                ['Cancelled', analytics.interviews.cancelledInterviews],
              ].map(([label, value]) => (
                <div className="recruitment-pipeline-row" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? 0}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="recruitment-empty">No interview statistics available.</p>
          )}
        </div>

        <div className="recruitment-card">
          <h3><Users size={19} /> Candidate Statistics</h3>
          {analytics.candidates ? (
            <div className="recruitment-pipeline-list">
              {[
                ['Selected', analytics.candidates.selectedCandidates],
                ['Rejected', analytics.candidates.rejectedCandidates],
                ['In Progress', analytics.candidates.candidatesInProgress],
              ].map(([label, value]) => (
                <div className="recruitment-pipeline-row" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? 0}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className="recruitment-empty">No candidate statistics available.</p>
          )}
        </div>
      </div>

      <div className="recruitment-card recruitment-department-card">
        <h3>Department Recruitment Statistics</h3>
        {analytics.departments.length ? (
          <div className="recruitment-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total Jobs</th>
                  <th>Applications</th>
                  <th>Selected</th>
                  <th>Rejected</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departments.map((item, index) => (
                  <tr key={index}>
                    <td>{item.department}</td>
                    <td>{item.totalJobs}</td>
                    <td>{item.totalApplications}</td>
                    <td>{item.selectedApplications}</td>
                    <td>{item.rejectedApplications}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="recruitment-empty">No department statistics available.</p>
        )}
      </div>
    </>
  )

  const renderJobs = () => (
    <div className="recruitment-card">
      <div className="recruitment-card-heading">
        <div>
          <h3>Job Openings</h3>
          <p>Manage available positions and vacancies.</p>
        </div>
        <button className="recruitment-primary-btn" onClick={() => openModal('job')}>
          <Plus size={17} /> Add Job
        </button>
      </div>

      <div className="recruitment-search">
        <Search size={18} />
        <input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="recruitment-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Department</th>
              <th>Location</th>
              <th>Vacancies</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title}</td>
                <td>{job.department}</td>
                <td>{job.location}</td>
                <td>{job.numberOfVacancies}</td>
                <td>{formatDate(job.applicationDeadline)}</td>
                <td>
                  <select
                    className="recruitment-status-select"
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value)}
                  >
                    {jobStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className="recruitment-icon-btn danger"
                    title="Delete job"
                    onClick={() => deleteRecord('/api/job-openings', job.id, 'job opening')}
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {!filteredJobs.length && (
              <tr><td colSpan="7" className="recruitment-empty">No job openings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderApplications = () => (
    <div className="recruitment-card">
      <div className="recruitment-card-heading">
        <div>
          <h3>Job Applications</h3>
          <p>Track applications and candidate progress.</p>
        </div>
      </div>

      <div className="recruitment-search">
        <Search size={18} />
        <input
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="recruitment-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Email</th>
              <th>Position</th>
              <th>Department</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => (
              <tr key={application.id}>
                <td>{application.candidateName}</td>
                <td>{application.candidateEmail}</td>
                <td>{application.jobTitle}</td>
                <td>{application.department}</td>
                <td>{formatDate(application.appliedAt)}</td>
                <td>
                  <select
                    className="recruitment-status-select"
                    value={application.status}
                    onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                  >
                    {applicationStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="recruitment-application-actions">
  <button
    type="button"
    className="screening-action-btn"
    title="View candidate profile"
    onClick={() => setSelectedApplication(application)}
  >
    <Eye size={15} />
    Profile
  </button>
  <button
    type="button"
    className="screening-action-btn"
    title="View candidate resume"
    disabled={!application.resumeFileName || resumeLoadingId === application.id}
    onClick={() => viewApplicationResume(application)}
  >
    <FileText size={15} />
    View PDF
  </button>
  <button
    type="button"
    className="screening-action-btn"
    title="Download candidate resume"
    disabled={!application.resumeFileName || resumeLoadingId === application.id}
    onClick={() => downloadApplicationResume(application)}
  >
    Download
  </button>
  <button
    type="button"
    className="screening-action-btn"
    title="Screen candidate resume"
    disabled={screeningLoadingId === application.id}
    onClick={() => screenResume(application.id)}
  >
    <ScanSearch size={15} />
    {screeningLoadingId === application.id ? 'Screening...' : 'Screen'}
  </button>
  <button
    type="button"
    className="recruitment-icon-btn danger"
    title="Delete application"
    onClick={() => deleteRecord('/api/job-applications', application.id, 'application')}
  >
    <Trash2 size={17} />
  </button>
</div>
                </td>
              </tr>
            ))}
            {!filteredApplications.length && (
              <tr><td colSpan="7" className="recruitment-empty">No applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderInterviews = () => (
    <div className="recruitment-card">
      <div className="recruitment-card-heading">
        <div>
          <h3>Interviews</h3>
          <p>Schedule and manage candidate interviews.</p>
        </div>
        <button className="recruitment-primary-btn" onClick={() => openModal('interview')}>
          <Plus size={17} /> Schedule Interview
        </button>
      </div>

      <div className="recruitment-search">
        <Search size={18} />
        <input
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="recruitment-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Round</th>
              <th>Interviewer</th>
              <th>Scheduled At</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterviews.map((interview) => (
              <tr key={interview.id}>
                <td>{interview.candidateName}</td>
                <td>{interview.jobTitle}</td>
                <td>{interview.round}</td>
                <td>{interview.interviewerName}</td>
                <td>{formatDateTime(interview.scheduledAt)}</td>
                <td>{interview.mode}</td>
                <td>
                  <span className={`recruitment-status ${interview.status?.toLowerCase()}`}>
                    {interview.status}
                  </span>
                </td>
                <td>
                  <button
                    className="recruitment-icon-btn"
                    title="Update interview status"
                    onClick={() => {
                      setSelectedInterview({
                        ...interview,
                        newStatus: interview.status,
                        cancellationReason: '',
                      })
                      openModal('interviewStatus')
                    }}
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    className="recruitment-icon-btn danger"
                    title="Delete interview"
                    onClick={() => deleteRecord('/api/interviews', interview.id, 'interview')}
                  >
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {!filteredInterviews.length && (
              <tr><td colSpan="9" className="recruitment-empty">No interviews found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )


  const renderFeedback = () => (
    <div className="recruitment-card">
      <div className="recruitment-card-heading">
        <div>
          <h3>Interview Feedback</h3>
          <p>Review interviewer evaluations and candidate recommendations.</p>
        </div>
        <strong>{feedbackList.length} submissions</strong>
      </div>

      <div className="recruitment-search">
        <Search size={18} />
        <input
          placeholder="Search candidate, interviewer or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="recruitment-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Position</th>
              <th>Interviewer</th>
              <th>Technical</th>
              <th>Communication</th>
              <th>Problem Solving</th>
              <th>Recommendation</th>
              <th>Submitted At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map((feedback) => (
              <tr key={feedback.id}>
                <td>
                  <strong>{feedback.candidateName}</strong>
                  <br />
                  <small>{feedback.candidateEmail}</small>
                </td>
                <td>{feedback.jobTitle}</td>
                <td>{feedback.interviewerName}</td>
                <td>{feedback.technicalRating}/5</td>
                <td>{feedback.communicationRating}/5</td>
                <td>{feedback.problemSolvingRating}/5</td>
                <td>
                  <span className={`recruitment-status ${String(feedback.recommendation || '').toLowerCase()}`}>
                    {feedback.recommendation}
                  </span>
                </td>
                                <td>{formatDateTime(feedback.submittedAt)}</td>
                <td>
                  <button
                    type="button"
                    className="feedback-view-btn"
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <Eye size={15} />
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {!filteredFeedback.length && (
              <tr>
                <td colSpan="9" className="recruitment-empty">
                  {feedbackList.length
                    ? 'No matching feedback found.'
                    : 'No interview feedback submitted yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredFeedback.map((feedback) => (
        <div className="recruitment-card" key={`details-${feedback.id}`}>
          <h3>
            {feedback.candidateName} - Interview #{feedback.interviewId}
          </h3>
          <p><strong>Strengths:</strong> {feedback.strengths || 'N/A'}</p>
          <p><strong>Areas for Improvement:</strong> {feedback.areasForImprovement || 'N/A'}</p>
          <p><strong>Comments:</strong> {feedback.comments || 'N/A'}</p>
        </div>
      ))}
    </div>
  )
  const renderInterviewQuestions = () => (
    <div className="recruitment-card">
      <div className="recruitment-card-heading">
        <div>
          <h3>Interview Question Generator</h3>
          <p>Generate and manage questions based on job role, skill and difficulty.</p>
        </div>
        <strong>{interviewQuestions.length} Questions</strong>
      </div>

      <form className="recruitment-form question-generator-form" onSubmit={handleGenerateQuestions}>
        <label>
          Job Role
          <input
            type="text"
            required
            placeholder="e.g. Java Developer"
            value={questionForm.jobRole}
            onChange={(e) => setQuestionForm({ ...questionForm, jobRole: e.target.value })}
          />
        </label>

        <label>
          Skill
          <input
            type="text"
            required
            placeholder="e.g. Spring Boot"
            value={questionForm.skill}
            onChange={(e) => setQuestionForm({ ...questionForm, skill: e.target.value })}
          />
        </label>

        <label>
          Difficulty
          <select
            value={questionForm.difficulty}
            onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </label>

        <label>
          Question Type
          <select
            value={questionForm.questionType}
            onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
          >
            <option value="TECHNICAL">Technical</option>
            <option value="HR">HR</option>
            <option value="SCENARIO">Scenario</option>
          </select>
        </label>

        <label>
          Number of Questions
          <input
            type="number"
            min="1"
            max="20"
            required
            value={questionForm.numberOfQuestions}
            onChange={(e) => setQuestionForm({ ...questionForm, numberOfQuestions: e.target.value })}
          />
        </label>

        <button
          className="recruitment-primary-btn"
          type="submit"
          disabled={generatingQuestions}
        >
          {generatingQuestions ? 'Generating...' : 'Generate Questions'}
        </button>
      </form>

      <div className="recruitment-table-wrapper">
        <table className="recruitment-table">
          <thead>
            <tr>
              <th>Job Role</th>
              <th>Skill</th>
              <th>Question</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {interviewQuestions.map((question) => (
              <tr key={question.id}>
                <td>{question.jobRole}</td>
                <td>{question.skill}</td>
                <td>{question.questionText}</td>
                <td>{question.difficulty}</td>
                <td>{question.questionType}</td>
                <td>{formatDateTime(question.createdAt)}</td>
                <td>
                  <button
                    type="button"
                    className="recruitment-icon-btn"
                    title="Delete question"
                    onClick={() => handleDeleteInterviewQuestion(question.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {interviewQuestions.length === 0 && (
          <div className="recruitment-empty">
            No interview questions available. Generate your first set above.
          </div>
        )}
      </div>
    </div>
  )
  const renderModal = () => {
    if (!modal) return null


  return (
      <div className="recruitment-modal-overlay" onClick={closeModal}>
        <div className="recruitment-modal" onClick={(e) => e.stopPropagation()}>
          <div className="recruitment-modal-heading">
            <h3>
              {{
                job: 'Create Job Opening',
                interview: 'Schedule Interview',
                interviewStatus: 'Update Interview Status',
              }[modal]}
            </h3>
            <button className="recruitment-icon-btn" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>

          {modal === 'job' && (
            <form onSubmit={handleJobSubmit} className="recruitment-form">
              <label>Job Title<input required value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} /></label>
              <label>Department<input required value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} /></label>
              <label>Description<textarea required value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} /></label>
              <label>Required Skills <small>(comma-separated)</small><input value={jobForm.requiredSkills} onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })} /></label>
              <label>Number of Vacancies<input type="number" min="1" required value={jobForm.numberOfVacancies} onChange={(e) => setJobForm({ ...jobForm, numberOfVacancies: e.target.value })} /></label>
              <label>Employment Type<select value={jobForm.employmentType} onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}><option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option></select></label>
              <label>Location<input required value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} /></label>
              <label>Minimum Salary<input type="number" min="0" value={jobForm.minimumSalary} onChange={(e) => setJobForm({ ...jobForm, minimumSalary: e.target.value })} /></label>
              <label>Maximum Salary<input type="number" min="0" value={jobForm.maximumSalary} onChange={(e) => setJobForm({ ...jobForm, maximumSalary: e.target.value })} /></label>
              <label>Application Deadline<input type="date" required value={jobForm.applicationDeadline} onChange={(e) => setJobForm({ ...jobForm, applicationDeadline: e.target.value })} /></label>
              <button className="recruitment-primary-btn" type="submit">Create Job</button>
            </form>
          )}

          {modal === 'interview' && (
            <form onSubmit={handleInterviewSubmit} className="recruitment-form">
              <label>Job Application
                <select required value={interviewForm.jobApplicationId} onChange={(e) => setInterviewForm({ ...interviewForm, jobApplicationId: e.target.value })}>
                  <option value="">Select Application</option>
                  {applications.map((application) => (
                    <option key={application.id} value={application.id}>
                      #{application.id} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â {application.candidateName} ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â {application.jobTitle}
                    </option>
                  ))}
                </select>
              </label>
              <label>Interviewer Employee ID<input type="number" min="1" required value={interviewForm.interviewerId} onChange={(e) => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })} /></label>
              <label>Interview Round<select value={interviewForm.round} onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}>{['SCREENING', 'TECHNICAL', 'MANAGERIAL', 'HR', 'FINAL'].map((round) => <option key={round}>{round}</option>)}</select></label>
              <label>Scheduled Date & Time<input type="datetime-local" required value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })} /></label>
              <label>Duration (minutes)<input type="number" min="1" required value={interviewForm.durationMinutes} onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })} /></label>
              <label>Interview Mode<select value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}><option value="ONLINE">Online</option><option value="IN_PERSON">In Person</option><option value="TELEPHONIC">Telephonic</option></select></label>
              <label>Meeting Link<input value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })} /></label>
              <label>Location<input value={interviewForm.location} onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })} /></label>
              <label>Notes<textarea value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} /></label>
              <button className="recruitment-primary-btn" type="submit">Schedule Interview</button>
            </form>
          )}

          {modal === 'interviewStatus' && selectedInterview && (
            <form
              className="recruitment-form"
              onSubmit={(e) => {
                e.preventDefault()
                updateInterviewStatus(
                  selectedInterview.id,
                  selectedInterview.newStatus || selectedInterview.status,
                  selectedInterview.cancellationReason || ''
                )
              }}
            >
              <p><strong>Candidate:</strong> {selectedInterview.candidateName}</p>
              <p><strong>Position:</strong> {selectedInterview.jobTitle}</p>
              <p><strong>Current Status:</strong> {selectedInterview.status}</p>

              <label>
                New Status
                <select
                  value={selectedInterview.newStatus || selectedInterview.status}
                  onChange={(e) =>
                    setSelectedInterview({
                      ...selectedInterview,
                      newStatus: e.target.value,
                      cancellationReason:
                        e.target.value === 'CANCELLED'
                          ? selectedInterview.cancellationReason || ''
                          : '',
                    })
                  }
                >
                  {interviewStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>

              {(selectedInterview.newStatus || selectedInterview.status) === 'CANCELLED' && (
                <label>
                  Cancellation Reason
                  <textarea
                    required
                    maxLength={1000}
                    placeholder="Please enter the reason for cancelling this interview..."
                    value={selectedInterview.cancellationReason || ''}
                    onChange={(e) =>
                      setSelectedInterview({
                        ...selectedInterview,
                        cancellationReason: e.target.value,
                      })
                    }
                  />
                </label>
              )}

              <button className="recruitment-primary-btn" type="submit">
                Update Status
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  const handleGenerateQuestions = async (event) => {
    event.preventDefault()
    setGeneratingQuestions(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        ...questionForm,
        jobRole: questionForm.jobRole.trim(),
        skill: questionForm.skill.trim(),
        numberOfQuestions: Number(questionForm.numberOfQuestions),
      }

      const response = await api.post(
        '/api/recruitment/interview-questions/generate',
        payload
      )

      const generated = Array.isArray(response.data) ? response.data : []
      setInterviewQuestions((previous) => [...generated, ...previous])
      showSuccess(`${generated.length} interview questions generated successfully.`)
    } catch (err) {
      handleError(err)
    } finally {
      setGeneratingQuestions(false)
    }
  }

  const handleDeleteInterviewQuestion = async (id) => {
    try {
      await api.delete(`/api/recruitment/interview-questions/${id}`)
      setInterviewQuestions((previous) =>
        previous.filter((question) => question.id !== id)
      )
      showSuccess('Interview question deleted successfully.')
    } catch (err) {
      handleError(err)
    }
  }
  return (
    <div className="recruitment-page">
      <div className="recruitment-header">
        <div>
          <h1>Recruitment Management</h1>
          <p>Manage job openings, candidates, applications and interviews.</p>
        </div>
        <button className="recruitment-refresh-btn" onClick={loadSection} disabled={loading}>
          <RefreshCw size={17} className={loading ? 'recruitment-spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="recruitment-tabs">
        {sections.map((section) => (
          <button
            key={section}
            className={activeSection === section ? 'active' : ''}
            onClick={() => {
              setActiveSection(section)
              setSearchTerm('')
            }}
          >
            {section}
          </button>
        ))}
      </div>

      {error && <div className="recruitment-alert error">{error}</div>}
      {success && <div className="recruitment-alert success">{success}</div>}

      {loading ? (
        <div className="recruitment-loading">
          <RefreshCw size={22} className="recruitment-spinning" />
          Loading recruitment data...
        </div>
      ) : (
        <>
          {activeSection === 'Overview' && renderOverview()}
          {activeSection === 'Job Openings' && renderJobs()}
          {activeSection === 'Applications' && renderApplications()}
          {activeSection === 'Interviews' && renderInterviews()}
          {activeSection === 'Interview Questions' && renderInterviewQuestions()}
          {activeSection === 'Feedback' && renderFeedback()}
        </>
      )}

            {selectedFeedback && (
        <div
          className="recruitment-modal-overlay"
          onClick={() => setSelectedFeedback(null)}
        >
          <div
            className="recruitment-modal feedback-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recruitment-modal-heading">
              <div>
                <h3>Interview Feedback Details</h3>
                <p>{selectedFeedback.candidateName} - Interview #{selectedFeedback.interviewId}</p>
              </div>
              <button
                type="button"
                className="feedback-close-btn"
                onClick={() => setSelectedFeedback(null)}
                aria-label="Close feedback details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="feedback-detail-grid">
              <div>
                <span>Candidate</span>
                <strong>{selectedFeedback.candidateName || 'â€”'}</strong>
                <small>{selectedFeedback.candidateEmail || 'â€”'}</small>
              </div>
              <div>
                <span>Position</span>
                <strong>{selectedFeedback.jobTitle || 'â€”'}</strong>
              </div>
              <div>
                <span>Interviewer</span>
                <strong>{selectedFeedback.interviewerName || 'â€”'}</strong>
              </div>
              <div>
                <span>Submitted At</span>
                <strong>{formatDateTime(selectedFeedback.submittedAt)}</strong>
              </div>
            </div>

            <h4 className="feedback-section-title">Evaluation Ratings</h4>
            <div className="feedback-rating-grid">
              <div>
                <span>Technical Skills</span>
                <strong>{selectedFeedback.technicalRating ?? 'â€”'} / 5</strong>
              </div>
              <div>
                <span>Communication</span>
                <strong>{selectedFeedback.communicationRating ?? 'â€”'} / 5</strong>
              </div>
              <div>
                <span>Problem Solving</span>
                <strong>{selectedFeedback.problemSolvingRating ?? 'â€”'} / 5</strong>
              </div>
            </div>

            <div className="feedback-text-section">
              <h4>Strengths</h4>
              <p>{selectedFeedback.strengths || 'No strengths provided.'}</p>
            </div>

            <div className="feedback-text-section">
              <h4>Areas for Improvement</h4>
              <p>{selectedFeedback.areasForImprovement || 'No improvement areas provided.'}</p>
            </div>

            <div className="feedback-text-section">
              <h4>Additional Comments</h4>
              <p>{selectedFeedback.comments || 'No additional comments.'}</p>
            </div>

            <div className="feedback-recommendation">
              <span>Final Recommendation</span>
              <strong className={`recruitment-status ${String(selectedFeedback.recommendation || '').toLowerCase()}`}>
                {selectedFeedback.recommendation || 'Not specified'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div
          className="recruitment-modal-overlay"
          onClick={() => setSelectedApplication(null)}
        >
          <div
            className="recruitment-modal candidate-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recruitment-modal-heading">
              <div>
                <h3>Candidate Profile</h3>
                <p>{selectedApplication.candidateName}</p>
              </div>
              <button
                type="button"
                className="recruitment-icon-btn"
                onClick={() => setSelectedApplication(null)}
                aria-label="Close candidate profile"
              >
                <X size={20} />
              </button>
            </div>

            <div className="candidate-profile-section">
              <h4>Personal Information</h4>
              <div className="candidate-profile-grid">
                <div><span>Full Name</span><strong>{selectedApplication.candidateName || 'Not provided'}</strong></div>
                <div><span>Email</span><strong>{selectedApplication.candidateEmail || 'Not provided'}</strong></div>
                <div><span>Phone Number</span><strong>{selectedApplication.phoneNumber || 'Not provided'}</strong></div>
                <div><span>Current Location</span><strong>{selectedApplication.currentLocation || 'Not provided'}</strong></div>
                <div><span>Years of Experience</span><strong>{selectedApplication.yearsOfExperience ?? 'Not provided'}</strong></div>
                <div><span>Highest Qualification</span><strong>{selectedApplication.highestQualification || 'Not provided'}</strong></div>
              </div>
            </div>

            <div className="candidate-profile-section">
              <h4>Skills</h4>
              <p>{selectedApplication.skills || 'No skills provided.'}</p>
            </div>

            <div className="candidate-profile-section">
              <h4>Application Information</h4>
              <div className="candidate-profile-grid">
                <div><span>Position</span><strong>{selectedApplication.jobTitle || 'Not provided'}</strong></div>
                <div><span>Department</span><strong>{selectedApplication.department || 'Not provided'}</strong></div>
                <div><span>Application Status</span><strong>{selectedApplication.status}</strong></div>
                <div><span>Applied Date</span><strong>{formatDate(selectedApplication.appliedAt)}</strong></div>
              </div>
            </div>

            <div className="candidate-profile-section">
              <h4>Cover Letter</h4>
              <p>{selectedApplication.coverLetter || 'No cover letter provided.'}</p>
            </div>

            <div className="candidate-profile-section candidate-profile-resume">
              <h4>Uploaded Resume</h4>
              <p>{selectedApplication.resumeFileName || 'No resume uploaded.'}</p>
              {selectedApplication.resumeFileName && (
                <button
                  type="button"
                  className="screening-action-btn"
                  onClick={() => viewApplicationResume(selectedApplication)}
                  disabled={resumeLoadingId === selectedApplication.id}
                >
                  <Eye size={15} />
                  {resumeLoadingId === selectedApplication.id ? 'Loading...' : 'View Resume PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {resumePreviewUrl && (
        <div
          className="recruitment-modal-overlay resume-preview-overlay"
          onClick={() => {
            URL.revokeObjectURL(resumePreviewUrl)
            setResumePreviewUrl('')
            setResumePreviewName('')
          }}
        >
          <div
            className="recruitment-modal resume-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recruitment-modal-heading">
              <div>
                <h3>Candidate Resume</h3>
                <p>{resumePreviewName}</p>
              </div>
              <button
                type="button"
                className="recruitment-icon-btn"
                onClick={() => {
                  URL.revokeObjectURL(resumePreviewUrl)
                  setResumePreviewUrl('')
                  setResumePreviewName('')
                }}
                aria-label="Close resume preview"
              >
                <X size={20} />
              </button>
            </div>
            <iframe
              className="resume-preview-frame"
              src={resumePreviewUrl}
              title="Candidate resume PDF"
            />
          </div>
        </div>
      )}

      {screeningResult && (
        <div
          className="recruitment-modal-overlay"
          onClick={() => setScreeningResult(null)}
        >
          <div
            className="recruitment-modal screening-result-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="recruitment-modal-heading">
              <div>
                <h3>Resume Screening Result</h3>
                <p>{screeningResult.candidateName} Â· {screeningResult.jobTitle}</p>
              </div>
              <button
                className="recruitment-icon-btn"
                onClick={() => setScreeningResult(null)}
                aria-label="Close screening result"
              >
                <X size={20} />
              </button>
            </div>

            <div className="screening-score-card">
              <span>Resume Match</span>
              <strong>{screeningResult.matchPercentage}%</strong>
              <div className="screening-progress">
                <div style={{ width: `${screeningResult.matchPercentage}%` }} />
              </div>
            </div>

            <div className="screening-skills-grid">
              <div className="screening-skill-group matched">
                <h4>Matched Skills ({screeningResult.matchedSkills?.length || 0})</h4>
                {screeningResult.matchedSkills?.length ? (
                  <ul>
                    {screeningResult.matchedSkills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No matched skills found.</p>
                )}
              </div>

              <div className="screening-skill-group missing">
                <h4>Missing Skills ({screeningResult.missingSkills?.length || 0})</h4>
                {screeningResult.missingSkills?.length ? (
                  <ul>
                    {screeningResult.missingSkills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No missing skills.</p>
                )}
              </div>
            </div>

            <div className="screening-summary">
              <h4>Screening Summary</h4>
              <p>{screeningResult.summary}</p>
            </div>
          </div>
        </div>
      )}

      {renderModal()}
    </div>
  )
}

export default Recruitment





