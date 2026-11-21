import {
  Users,
  Building2,
  ShieldCheck,
  UserPlus,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Settings,
  ArrowUpRight,
  Building,
  Activity
} from 'lucide-react'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'

import './AdminDashboard.css'

function AdminDashboard({
  user,
  dashboardData,
  departmentChartData,
  onNavigate
}) {
  const firstName =
    user?.firstName ||
    user?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Admin'

  const totalEmployees = dashboardData?.totalEmployees
  const departmentCount = dashboardData?.departmentCount

  const shortcuts = [
    {
      title: 'Employee Management',
      description: 'View, add and manage organization employees.',
      icon: Users,
      page: 'Employees',
      tone: 'purple'
    },
    {
      title: 'Department Management',
      description: 'Manage departments and their structure.',
      icon: Building,
      page: 'Departments',
      tone: 'blue'
    },
    {
      title: 'Recruitment',
      description: 'Manage candidates and hiring activities.',
      icon: BriefcaseBusiness,
      page: 'Recruitment',
      tone: 'orange'
    },
    {
      title: 'Audit Logs',
      description: 'Review recorded system activities.',
      icon: ClipboardList,
      page: 'Audit Logs',
      tone: 'green'
    },
    {
      title: 'Onboarding',
      description: 'Access employee onboarding workflows.',
      icon: UserPlus,
      page: 'Onboarding',
      tone: 'indigo'
    },
    {
      title: 'Documents',
      description: 'Access organization document management.',
      icon: FileText,
      page: 'Documents',
      tone: 'rose'
    }
  ]

  return (
    <div className="admin-dashboard">
      <section className="admin-welcome">
        <div>
          <p className="admin-eyebrow">
            ADMINISTRATION / OVERVIEW
          </p>

          <h1>Welcome back, {firstName}</h1>

          <p className="admin-welcome-subtitle">
            Monitor your organization and manage its workforce from one place.
          </p>
        </div>

        <div className="admin-role-label">
          <ShieldCheck size={17} />
          <span>System Administrator</span>
        </div>
      </section>

      <section className="admin-section-heading">
        <div>
          <h2>Organization Overview</h2>
          <p>Verified workforce information from IntelliHR</p>
        </div>
      </section>

      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon purple">
              <Users size={21} />
            </div>
            <span className="admin-stat-caption">Workforce</span>
          </div>

          <h3>
            {totalEmployees ?? '—'}
          </h3>

          <p>Total Employees</p>
          <span className="admin-stat-description">
            Employees registered in IntelliHR
          </span>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-top">
            <div className="admin-stat-icon blue">
              <Building2 size={21} />
            </div>
            <span className="admin-stat-caption">Structure</span>
          </div>

          <h3>
            {departmentCount ?? '—'}
          </h3>

          <p>Total Departments</p>
          <span className="admin-stat-description">
            Departments registered in IntelliHR
          </span>
        </article>

        <article className="admin-stat-card admin-stat-info">
          <div className="admin-stat-top">
            <div className="admin-stat-icon green">
              <ShieldCheck size={21} />
            </div>
            <span className="admin-stat-caption">Access control</span>
          </div>

          <h3>RBAC</h3>

          <p>Role-Based Security</p>
          <span className="admin-stat-description">
            Access controlled by assigned user roles
          </span>
        </article>
      </section>

      <section className="admin-chart-section">
        <div className="admin-section-heading">
          <div>
            <h2>Department Distribution</h2>
            <p>Employee count across registered departments</p>
          </div>
        </div>

        <article className="admin-panel">
          {departmentChartData?.length > 0 ? (
            <>
              <div className="admin-chart-summary">
                <div>
                  <span className="admin-chart-dot" />
                  <span>Employees by department</span>
                </div>

                <strong>{totalEmployees ?? '—'} employees</strong>
              </div>

              <div className="admin-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentChartData}
                    margin={{
                      top: 18,
                      right: 18,
                      left: -18,
                      bottom: 8
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke="var(--admin-chart-grid)"
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'var(--admin-chart-text)',
                        fontSize: 12
                      }}
                      dy={10}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: 'var(--admin-chart-text)',
                        fontSize: 12
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        background: 'var(--admin-tooltip-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 10,
                        color: 'var(--admin-text)'
                      }}
                      formatter={(value) => [
                        `${value} employees`,
                        'Total'
                      ]}
                    />

                    <Bar
                      dataKey="employees"
                      name="Employees"
                      fill="#7965df"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={58}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="admin-empty-chart">
              <Building2 size={28} />
              <strong>No department data available</strong>
              <span>
                Department distribution will appear when department data is available.
              </span>
            </div>
          )}
        </article>
      </section>

      <section className="admin-shortcuts-section">
        <div className="admin-section-heading">
          <div>
            <h2>Management Workspace</h2>
            <p>Quick access to administration modules</p>
          </div>
        </div>

        <div className="admin-shortcuts-grid">
          {shortcuts.map((item) => {
            const Icon = item.icon

            return (
              <button
                type="button"
                className="admin-shortcut-card"
                key={item.page}
                onClick={() => onNavigate?.(item.page)}
              >
                <div className={`admin-shortcut-icon ${item.tone}`}>
                  <Icon size={20} />
                </div>

                <div className="admin-shortcut-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <ArrowUpRight
                  className="admin-shortcut-arrow"
                  size={18}
                />
              </button>
            )
          })}
        </div>
      </section>

      <footer className="admin-dashboard-footer">
        <span>IntelliHR Administration</span>
        <span>People first. Progress together.</span>
      </footer>
    </div>
  )
}

export default AdminDashboard