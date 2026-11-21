import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  MapPin,
  Clock3,
  FileText,
  Upload,
  LogOut,
  UserRound,
  GraduationCap,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Building2,
  CalendarDays,
  IndianRupee,
  X,
} from 'lucide-react'
import candidateApi from '../../services/candidateApi'
import './CandidateDashboard.css'

function formatDate(value) {
  if (!value) return 'Not specified'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatSalary(minimum, maximum) {
  if (minimum == null && maximum == null) return 'Salary not disclosed'

  const format = (value) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(value)

  if (minimum != null && maximum != null) {
    return `\u20B9${format(minimum)} - \u20B9${format(maximum)}`
  }

  return minimum != null
    ? `From \u20B9${format(minimum)}`
    : `Up to \u20B9${format(maximum)}`
}
function getStatusClass(status) {
  return String(status || 'APPLIED').toLowerCase().replaceAll('_', '-')
}

function CandidateDashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [applyingJob, setApplyingJob] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [submittingApplication, setSubmittingApplication] = useState(false)
  const [activeTab, setActiveTab] = useState('jobs')
  const [searchTerm, setSearchTerm] = useState('')

  const logout = () => {
    localStorage.removeItem('candidate_token')
    localStorage.removeItem('candidate_user')
    navigate('/careers', { replace: true })
  }

  const loadDashboard = async () => {
    if (!localStorage.getItem('candidate_token')) {
      navigate('/careers/login', { replace: true })
      return
    }

    setLoading(true)
    setPageError('')

    const results = await Promise.allSettled([
      candidateApi.get('/api/candidates/me'),
      candidateApi.get('/api/job-applications/me'),
      candidateApi.get('/api/job-openings/public'),
    ])

    const [profileResult, applicationsResult, jobsResult] = results

    if (profileResult.status === 'fulfilled') {
      setProfile(profileResult.value.data)
    } else {
      const status = profileResult.reason?.response?.status

      if (status === 401 || status === 403) {
        logout()
        return
      }

      setPageError(
        profileResult.reason?.response?.data?.message ||
        'Unable to load your candidate profile.'
      )
    }

    if (applicationsResult.status === 'fulfilled') {
      setApplications(applicationsResult.value.data || [])
    }

    if (jobsResult.status === 'fulfilled') {
      setJobs(jobsResult.value.data || [])
    } else {
      setPageError((previous) =>
        previous || 'Unable to load available jobs. Please try again.'
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleResumeUpload = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setPageError('Please select a PDF resume first.')
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setPageError('Only PDF resumes are supported.')
      return
    }

    try {
      setUploading(true)
      setPageError('')
      setSuccessMessage('')

      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await candidateApi.post(
        '/api/candidates/me/resume',
        formData
      )

      setProfile(response.data)
      setSelectedFile(null)
      event.target.reset()
      setSuccessMessage('Your resume has been uploaded successfully.')
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Resume upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleApply = async (event) => {
    event.preventDefault()

    if (!applyingJob) return

    if (!profile?.resumeFileName) {
      setPageError('Please upload your PDF resume before applying.')
      setApplyingJob(null)
      setActiveTab('profile')
      return
    }

    try {
      setSubmittingApplication(true)
      setPageError('')
      setSuccessMessage('')

      await candidateApi.post('/api/job-applications/me', {
        jobOpeningId: applyingJob.id,
        coverLetter: coverLetter.trim() || null,
      })

      setApplyingJob(null)
      setCoverLetter('')
      setSuccessMessage('Your application has been submitted successfully.')
      setActiveTab('applications')

      const response = await candidateApi.get('/api/job-applications/me')
      setApplications(response.data || [])
    } catch (error) {
      setPageError(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Unable to submit your application. Please try again.'
      )
    } finally {
      setSubmittingApplication(false)
    }
  }

  const appliedJobIds = new Set(
    applications.map((application) => application.jobOpeningId)
  )

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.trim().toLowerCase()

    if (!search) return true

    return [
      job.title,
      job.department,
      job.location,
      job.employmentType,
      job.requiredSkills,
    ].some((value) => String(value || '').toLowerCase().includes(search))
  })

  if (loading) {
    return (
      <main className="candidate-dashboard-loading">
        <LoaderCircle size={34} className="candidate-spin" />
        <p>Loading your candidate dashboard...</p>
      </main>
    )
  }

  return (
    <div className="candidate-dashboard">
      <header className="candidate-dashboard-header">
        <Link to="/careers" className="candidate-dashboard-brand">
          <BriefcaseBusiness size={27} />
          <span>IntelliHR <strong>Careers</strong></span>
        </Link>

        <div className="candidate-dashboard-header-right">
          <span className="candidate-welcome">
            Welcome, {profile?.firstName || 'Candidate'}
          </span>
          <button className="candidate-logout-button" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </header>

      <main className="candidate-dashboard-main">
        <section className="candidate-dashboard-welcome">
          <div>
            <span className="candidate-dashboard-eyebrow">CANDIDATE PORTAL</span>
            <h1>Your career journey starts here.</h1>
            <p>Discover opportunities and keep track of your applications.</p>
          </div>
          <div className="candidate-welcome-icon">
            <BriefcaseBusiness size={42} />
          </div>
        </section>

        {pageError && (
          <div className="candidate-dashboard-alert error" role="alert">
            <AlertCircle size={18} />
            <span>{pageError}</span>
            <button onClick={() => setPageError('')} aria-label="Dismiss">
              <X size={17} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="candidate-dashboard-alert success" role="status">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage('')} aria-label="Dismiss">
              <X size={17} />
            </button>
          </div>
        )}

        <section className="candidate-dashboard-stats">
          <article className="candidate-stat-card">
            <div className="candidate-stat-icon blue"><BriefcaseBusiness size={21} /></div>
            <div>
              <span>Available jobs</span>
              <strong>{jobs.length}</strong>
            </div>
          </article>
          <article className="candidate-stat-card">
            <div className="candidate-stat-icon purple"><Send size={21} /></div>
            <div>
              <span>My applications</span>
              <strong>{applications.length}</strong>
            </div>
          </article>
          <article className="candidate-stat-card">
            <div className="candidate-stat-icon green"><FileText size={21} /></div>
            <div>
              <span>Resume status</span>
              <strong className="candidate-stat-status">
                {profile?.resumeFileName ? 'Uploaded' : 'Pending'}
              </strong>
            </div>
          </article>
        </section>

        <nav className="candidate-dashboard-tabs">
          <button
            className={activeTab === 'jobs' ? 'active' : ''}
            onClick={() => setActiveTab('jobs')}
          >
            <Search size={17} /> Browse jobs
          </button>
          <button
            className={activeTab === 'applications' ? 'active' : ''}
            onClick={() => setActiveTab('applications')}
          >
            <Send size={17} /> My applications
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            <UserRound size={17} /> My profile
          </button>
        </nav>

        {activeTab === 'jobs' && (
          <section className="candidate-dashboard-section">
            <div className="candidate-section-heading">
              <div>
                <h2>Explore opportunities</h2>
                <p>Find a role that matches your skills and ambitions.</p>
              </div>
              <div className="candidate-job-search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search jobs, skills, location..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="candidate-empty-state">
                <BriefcaseBusiness size={38} />
                <h3>No jobs found</h3>
                <p>Try another search or check back later for new opportunities.</p>
              </div>
            ) : (
              <div className="candidate-job-grid">
                {filteredJobs.map((job) => {
                  const alreadyApplied = appliedJobIds.has(job.id)

                  return (
                    <article className="candidate-job-card" key={job.id}>
                      <div className="candidate-job-card-top">
                        <div className="candidate-job-icon">
                          <Building2 size={23} />
                        </div>
                        <span className="candidate-job-status">
                          {job.status}
                        </span>
                      </div>

                      <h3>{job.title}</h3>
                      <p className="candidate-job-department">{job.department}</p>

                      <div className="candidate-job-meta">
                        <span><MapPin size={15} />{job.location || 'Location not specified'}</span>
                        <span><Clock3 size={15} />{job.employmentType || 'Not specified'}</span>
                        <span><IndianRupee size={15} />{formatSalary(job.minimumSalary, job.maximumSalary)}</span>
                        <span><CalendarDays size={15} />Deadline: {formatDate(job.applicationDeadline)}</span>
                      </div>

                      <p className="candidate-job-description">
                        {job.description || 'No job description provided.'}
                      </p>

                      {job.requiredSkills && (
                        <div className="candidate-job-skills">
                          <strong>Required skills</strong>
                          <p>{job.requiredSkills}</p>
                        </div>
                      )}

                      <div className="candidate-job-card-footer">
                        <span>{job.numberOfVacancies ?? 0} vacancies</span>
                        <button
                          disabled={alreadyApplied}
                          onClick={() => {
                            setApplyingJob(job)
                            setCoverLetter('')
                            setPageError('')
                          }}
                        >
                          {alreadyApplied ? (
                            <><CheckCircle2 size={16} /> Applied</>
                          ) : (
                            <>Apply now <Send size={16} /></>
                          )}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'applications' && (
          <section className="candidate-dashboard-section">
            <div className="candidate-section-heading">
              <div>
                <h2>My applications</h2>
                <p>Track the progress of the jobs you have applied for.</p>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="candidate-empty-state">
                <Send size={38} />
                <h3>No applications yet</h3>
                <p>Explore available jobs and submit your first application.</p>
                <button onClick={() => setActiveTab('jobs')}>Browse jobs</button>
              </div>
            ) : (
              <div className="candidate-application-list">
                {applications.map((application) => (
                  <article className="candidate-application-card" key={application.id}>
                    <div className="candidate-application-icon">
                      <BriefcaseBusiness size={22} />
                    </div>
                    <div className="candidate-application-details">
                      <h3>{application.jobTitle || 'Job application'}</h3>
                      <p>{application.department || 'Department not specified'}</p>
                      <span>Applied on {formatDate(application.appliedAt)}</span>
                      {application.coverLetter && (
                        <details>
                          <summary>View cover letter</summary>
                          <p>{application.coverLetter}</p>
                        </details>
                      )}
                    </div>
                    <span className={`candidate-application-status ${getStatusClass(application.status)}`}>
                      {String(application.status || 'APPLIED').replaceAll('_', ' ')}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="candidate-dashboard-section">
            <div className="candidate-section-heading">
              <div>
                <h2>My profile</h2>
                <p>Your personal and professional information.</p>
              </div>
            </div>

            {profile && (
              <div className="candidate-profile-layout">
                <article className="candidate-profile-card">
                  <div className="candidate-profile-heading">
                    <div className="candidate-profile-avatar">
                      {(profile.firstName || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{profile.firstName} {profile.lastName}</h3>
                      <p>{profile.email}</p>
                    </div>
                  </div>

                  <div className="candidate-profile-fields">
                    <div><UserRound size={18} /><span><small>Phone number</small><strong>{profile.phoneNumber || 'Not provided'}</strong></span></div>
                    <div><MapPin size={18} /><span><small>Current location</small><strong>{profile.currentLocation || 'Not provided'}</strong></span></div>
                    <div><Clock3 size={18} /><span><small>Experience</small><strong>{profile.yearsOfExperience ?? 0} years</strong></span></div>
                    <div><GraduationCap size={18} /><span><small>Highest qualification</small><strong>{profile.highestQualification || 'Not provided'}</strong></span></div>
                    <div className="candidate-profile-full"><FileText size={18} /><span><small>Skills</small><strong>{profile.skills || 'Not provided'}</strong></span></div>
                  </div>
                </article>

                <article className="candidate-resume-card">
                  <div className="candidate-resume-icon"><FileText size={25} /></div>
                  <h3>Your resume</h3>
                  <p>Upload your latest resume in PDF format. A resume is required before applying for jobs.</p>

                  {profile.resumeFileName ? (
                    <div className="candidate-resume-current">
                      <CheckCircle2 size={18} />
                      <span>Resume uploaded</span>
                    </div>
                  ) : (
                    <div className="candidate-resume-missing">
                      <AlertCircle size={18} />
                      <span>No resume uploaded yet</span>
                    </div>
                  )}

                  <form onSubmit={handleResumeUpload}>
                    <label className="candidate-file-input">
                      <Upload size={18} />
                      <span>{selectedFile ? selectedFile.name : 'Choose PDF resume'}</span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                      />
                    </label>
                    <button
                      type="submit"
                      className="candidate-upload-button"
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? 'Uploading...' : 'Upload resume'}
                    </button>
                  </form>
                </article>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="candidate-dashboard-footer">
        &copy; 2026 IntelliHR Careers. All rights reserved.
      </footer>

      {applyingJob && (
        <div className="candidate-modal-backdrop" onClick={() => !submittingApplication && setApplyingJob(null)}>
          <section
            className="candidate-apply-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-apply-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="candidate-modal-close"
              onClick={() => setApplyingJob(null)}
              disabled={submittingApplication}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <span className="candidate-dashboard-eyebrow">JOB APPLICATION</span>
            <h2 id="candidate-apply-title">Apply for {applyingJob.title}</h2>
            <p>{applyingJob.department} {"\u00B7"} {applyingJob.location}</p>

            <div className="candidate-modal-resume">
              {profile?.resumeFileName ? (
                <><CheckCircle2 size={18} /> Resume ready for submission</>
              ) : (
                <><AlertCircle size={18} /> Upload your resume in My profile first</>
              )}
            </div>

            <form onSubmit={handleApply}>
              <label htmlFor="candidate-cover-letter">Cover letter <span>(Optional)</span></label>
              <textarea
                id="candidate-cover-letter"
                rows={5}
                maxLength={2000}
                placeholder="Briefly explain why you are interested in this position..."
                value={coverLetter}
                onChange={(event) => setCoverLetter(event.target.value)}
              />
              <small className="candidate-character-count">{coverLetter.length}/2000 characters</small>

              <button
                type="submit"
                className="candidate-upload-button"
                disabled={submittingApplication || !profile?.resumeFileName}
              >
                {submittingApplication ? 'Submitting...' : 'Submit application'}
                {!submittingApplication && <Send size={17} />}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default CandidateDashboard