
import { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck, Search, RefreshCw, Activity,
  CheckCircle2, AlertTriangle, Clock, Filter
} from 'lucide-react'
import api from '../services/api'
import './AuditLogs.css'

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const loadLogs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/api/audit-logs')
      setLogs(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load audit logs. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = useMemo(() => {
    const term = search.trim().toLowerCase()

    return logs.filter(log => {
      const matchesAction =
        actionFilter === 'ALL' || log.action === actionFilter

      const matchesSearch =
        !term ||
        log.userEmail?.toLowerCase().includes(term) ||
        log.endpoint?.toLowerCase().includes(term) ||
        log.httpMethod?.toLowerCase().includes(term) ||
        String(log.statusCode).includes(term)

      return matchesAction && matchesSearch
    })
  }, [logs, search, actionFilter])

  const successfulCount = logs.filter(
    log => log.statusCode >= 200 && log.statusCode < 400
  ).length

  const failedCount = logs.length - successfulCount

  const getActionClass = action => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'audit-action-create'
      case 'UPDATE':
        return 'audit-action-update'
      case 'DELETE':
        return 'audit-action-delete'
      default:
        return 'audit-action-default'
    }
  }

  return (
    <div className="audit-page">
      <div className="audit-heading">
        <div>
          <div className="audit-title-row">
            <div className="audit-title-icon">
              <ShieldCheck size={23} />
            </div>
            <h2>Audit Logs</h2>
          </div>
          <p>Monitor important activities and API operations across IntelliHR.</p>
        </div>

        <button
          className="audit-refresh-button"
          onClick={loadLogs}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'audit-spinning' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="audit-error">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={loadLogs}>Retry</button>
        </div>
      )}

      <div className="audit-stats">
        <article className="audit-stat-card">
          <div className="audit-stat-icon purple">
            <Activity size={21} />
          </div>
          <div>
            <span>Total Activities</span>
            <strong>{logs.length}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon green">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Successful Requests</span>
            <strong>{successfulCount}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon orange">
            <AlertTriangle size={21} />
          </div>
          <div>
            <span>Unsuccessful Requests</span>
            <strong>{failedCount}</strong>
          </div>
        </article>

        <article className="audit-stat-card">
          <div className="audit-stat-icon blue">
            <Clock size={21} />
          </div>
          <div>
            <span>Latest Activity</span>
            <strong className="audit-latest">
              {logs.length ? formatDate(logs[0].createdAt) : '—'}
            </strong>
          </div>
        </article>
      </div>

      <section className="audit-list-section">
        <div className="audit-list-heading">
          <div>
            <h3>Activity History</h3>
            <p>Review recorded actions performed by authenticated users.</p>
          </div>
          <span className="audit-record-count">
            {filteredLogs.length} Records
          </span>
        </div>

        <div className="audit-toolbar">
          <div className="audit-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search email, endpoint or status..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <div className="audit-filter">
            <Filter size={16} />
            <select
              value={actionFilter}
              onChange={event => setActionFilter(event.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </div>

        <div className="audit-table-card">
          {loading ? (
            <div className="audit-empty">Loading audit records...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="audit-empty">
              <ShieldCheck size={36} />
              <strong>No audit records found</strong>
              <span>
                {logs.length
                  ? 'Try changing your search or action filter.'
                  : 'Activities will appear here when users perform actions.'}
              </span>
            </div>
          ) : (
            <div className="audit-table-scroll">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>USER</th>
                    <th>ACTION</th>
                    <th>ENDPOINT</th>
                    <th>METHOD</th>
                    <th>STATUS</th>
                    <th>IP ADDRESS</th>
                    <th>DATE & TIME</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <strong className="audit-user">
                          {log.userEmail}
                        </strong>
                      </td>

                      <td>
                        <span className={`audit-action ${getActionClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      <td>
                        <span className="audit-endpoint" title={log.endpoint}>
                          {log.endpoint}
                        </span>
                      </td>

                      <td>
                        <span className="audit-method">
                          {log.httpMethod}
                        </span>
                      </td>

                      <td>
                        <span className={`audit-status ${
                          log.statusCode >= 200 && log.statusCode < 400
                            ? 'success'
                            : 'failure'
                        }`}>
                          {log.statusCode}
                        </span>
                      </td>

                      <td>{log.ipAddress || '—'}</td>
                      <td className="audit-date">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="audit-footer">
        <ShieldCheck size={16} />
        Audit records are available to administrators only.
      </div>
    </div>
  )
}

export default AuditLogs
