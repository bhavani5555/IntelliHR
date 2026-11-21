
import { useEffect, useMemo, useState } from 'react'
import {
  FileText, FileImage, Upload, Download, Trash2, Search,
  RefreshCw, Users, FolderOpen, X, CheckCircle2, AlertCircle
} from 'lucide-react'
import api from '../services/api'
import './Documents.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(1)} KB`
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function Documents({ isManagementUser }) {
  const [employees, setEmployees] = useState([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [documents, setDocuments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('intellihr_user') || '{}')
    } catch {
      return {}
    }
  })

  const [employeeId, setEmployeeId] = useState('')

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

      const list = response.data.content || []
      setEmployees(list)

      if (!selectedEmployeeId && list.length > 0) {
        setSelectedEmployeeId(String(list[0].id))
      }
    } catch {
      setError('Unable to load employees.')
    }
  }

  const loadMyEmployee = async () => {
    try {
      const response = await api.get('/api/employees/search', {
        params: {
          search: currentUser.email,
          page: 0,
          size: 10,
          sortBy: 'id',
          direction: 'asc',
        },
      })

      const employee = (response.data.content || []).find(
        item => item.email?.toLowerCase() === currentUser.email?.toLowerCase()
      )

      if (employee) setEmployeeId(String(employee.id))
      else setError('Your employee profile could not be found.')
    } catch {
      setError('Unable to load your employee profile.')
    }
  }

  const loadDocuments = async (id) => {
    if (!id) return

    setLoading(true)
    setError('')

    try {
      const response = await api.get(`/api/employees/${id}/documents`)
      setDocuments(response.data || [])
    } catch (err) {
      setDocuments([])
      setError(
        err.response?.data?.message || 'Unable to load documents.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isManagementUser) loadEmployees()
    else loadMyEmployee()
  }, [isManagementUser])

  useEffect(() => {
    const id = isManagementUser ? selectedEmployeeId : employeeId
    if (id) loadDocuments(id)
  }, [selectedEmployeeId, employeeId, isManagementUser])

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return documents

    return documents.filter(document =>
      document.originalFileName?.toLowerCase().includes(term) ||
      document.contentType?.toLowerCase().includes(term)
    )
  }, [documents, search])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setError('')
    setSuccess('')

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF, JPG and PNG files are allowed.')
      event.target.value = ''
      setSelectedFile(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size cannot exceed 5 MB.')
      event.target.value = ''
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async (event) => {
    event.preventDefault()

    const id = selectedEmployeeId
    if (!id || !selectedFile) {
      setError('Please select an employee and a file.')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      await api.post(`/api/employees/${id}/documents`, formData)
      setSelectedFile(null)
      event.target.reset()
      setSuccess('Document uploaded successfully.')
      await loadDocuments(id)
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to upload document.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (document) => {
    try {
      const response = await api.get(
        `/api/documents/${document.id}/download`,
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], {
        type: document.contentType || 'application/octet-stream',
      })

      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = document.originalFileName
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Unable to download this document.')
    }
  }

  const handleDelete = async (document) => {
    if (!window.confirm(`Delete "${document.originalFileName}"?`)) return

    try {
      await api.delete(`/api/documents/${document.id}`)
      setDocuments(previous =>
        previous.filter(item => item.id !== document.id)
      )
      setSuccess('Document deleted successfully.')
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete document.')
    }
  }

  const selectedEmployee = employees.find(
    item => String(item.id) === selectedEmployeeId
  )

  const totalSize = documents.reduce(
    (total, item) => total + (item.fileSize || 0), 0
  )

  return (
    <div className="documents-page">
      <div className="documents-heading">
        <div>
          <h2>Document Management</h2>
          <p>Securely manage and access employee documents.</p>
        </div>

        <div className="documents-total">
          <FolderOpen size={19} />
          <span>{documents.length} Documents</span>
        </div>
      </div>

      {error && (
        <div className="documents-alert error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={() => setError('')} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="documents-alert success">
          <CheckCircle2 size={17} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="documents-stats">
        <div className="documents-stat-card">
          <div className="documents-stat-icon purple">
            <FileText size={21} />
          </div>
          <div>
            <span>Total Documents</span>
            <strong>{documents.length}</strong>
          </div>
        </div>

        <div className="documents-stat-card">
          <div className="documents-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>{isManagementUser ? 'Selected Employee' : 'My Documents'}</span>
            <strong>
              {isManagementUser
                ? selectedEmployee
                  ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                  : '—'
                : documents.length}
            </strong>
          </div>
        </div>

        <div className="documents-stat-card">
          <div className="documents-stat-icon green">
            <FolderOpen size={21} />
          </div>
          <div>
            <span>Total Storage</span>
            <strong>{formatFileSize(totalSize)}</strong>
          </div>
        </div>
      </div>

      {isManagementUser && (
        <section className="documents-upload-card">
          <div className="documents-section-heading">
            <div>
              <h3>Upload Document</h3>
              <p>Upload a PDF or image for an employee.</p>
            </div>
            <div className="upload-heading-icon">
              <Upload size={20} />
            </div>
          </div>

          <form className="documents-upload-form" onSubmit={handleUpload}>
            <div className="documents-form-group">
              <label htmlFor="documentEmployee">Select Employee</label>
              <select
                id="documentEmployee"
                value={selectedEmployeeId}
                onChange={event => setSelectedEmployeeId(event.target.value)}
                required
              >
                <option value="">Choose an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} — {employee.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="documents-form-group">
              <label htmlFor="documentFile">Choose File</label>
              <input
                id="documentFile"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                required
              />
              <small>PDF, JPG or PNG · Maximum 5 MB</small>
            </div>

            {selectedFile && (
              <div className="documents-selected-file">
                <FileText size={17} />
                <span>{selectedFile.name}</span>
                <small>{formatFileSize(selectedFile.size)}</small>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    const input = window.document.getElementById('documentFile')
                    if (input) input.value = ''
                  }}
                  aria-label="Remove selected file"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <button
              className="documents-upload-button"
              type="submit"
              disabled={uploading || !selectedEmployeeId || !selectedFile}
            >
              <Upload size={17} />
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </section>
      )}

      <section className="documents-list-section">
        <div className="documents-list-heading">
          <div>
            <h3>{isManagementUser ? 'Employee Documents' : 'My Documents'}</h3>
            <p>View, download and manage uploaded files.</p>
          </div>
        </div>

        <div className="documents-toolbar">
          <div className="documents-search">
            <Search size={17} />
            <input
              placeholder="Search documents..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <button
            className="documents-refresh"
            onClick={() => loadDocuments(
              isManagementUser ? selectedEmployeeId : employeeId
            )}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="documents-table-card">
          {loading ? (
            <div className="documents-empty">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <div className="documents-empty">
              <FolderOpen size={35} />
              <strong>No documents found</strong>
              <span>
                {search
                  ? 'Try another search term.'
                  : 'Uploaded employee documents will appear here.'}
              </span>
            </div>
          ) : (
            <div className="documents-table-scroll">
              <table className="documents-table">
                <thead>
                  <tr>
                    <th>DOCUMENT</th>
                    <th>FILE TYPE</th>
                    <th>FILE SIZE</th>
                    <th>UPLOADED DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map(document => (
                    <tr key={document.id}>
                      <td>
                        <div className="document-name-cell">
                          <div className="document-file-icon">
                            {document.contentType?.startsWith('image/')
                              ? <FileImage size={19} />
                              : <FileText size={19} />}
                          </div>
                          <div>
                            <strong>{document.originalFileName}</strong>
                            <span>DOC-{document.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="document-type">
                          {document.contentType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </td>
                      <td>{formatFileSize(document.fileSize)}</td>
                      <td>{formatDate(document.uploadedAt)}</td>
                      <td>
                        <div className="document-actions">
                          <button
                            title="Download document"
                            aria-label="Download document"
                            onClick={() => handleDownload(document)}
                          >
                            <Download size={17} />
                          </button>
                          {isManagementUser && (
                            <button
                              className="document-delete"
                              title="Delete document"
                              aria-label="Delete document"
                              onClick={() => handleDelete(document)}
                            >
                              <Trash2 size={17} />
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
        </div>
      </section>
    </div>
  )
}

export default Documents
