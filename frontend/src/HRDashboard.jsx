import {
  Users,
  Building2,
  UserPlus,
  CalendarCheck,
  ClipboardList,
  BriefcaseBusiness,
  UserRound,
  FileText,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'
import './HRDashboard.css'

function HRDashboard({
  user,
  dashboardData,
  departmentChartData = [],
  onNavigate
}) {
  const firstName =
    user?.firstName ||
    user?.name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'HR Manager'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const maxEmployees = Math.max(
    ...departmentChartData.map((item) => Number(item.employees) || 0),
    1
  )

  const shortcuts = [
    {
      title: 'Employee Directory',
      description: 'View and manage employee records',
      icon: Users,
      page: 'Employees',
      tone: 'blue'
    },
    {
      title: 'Leave Management',
      description: 'Review employee leave requests',
      icon: CalendarCheck,
      page: 'Leave Management',
      tone: 'orange'
    },
    {
      title: 'Recruitment',
      description: 'Manage hiring and candidate progress',
      icon: BriefcaseBusiness,
      page: 'Recruitment',
      tone: 'purple'
    },
    {
      title: 'Onboarding',
      description: 'Track new employee onboarding',
      icon: UserPlus,
      page: 'Onboarding',
      tone: 'green'
    },
    {
      title: 'Departments',
      description: 'View organizational departments',
      icon: Building2,
      page: 'Departments',
      tone: 'cyan'
    },
    {
      title: 'HR Documents',
      description: 'Access employee and policy documents',
      icon: FileText,
      page: 'Documents',
      tone: 'pink'
    }
  ]

  return (
    <div className="hr-dashboard">
      <section className="hr-welcome">
        <div className="hr-welcome-content">
          <span className="hr-eyebrow">
            <Sparkles size={15} />
            HUMAN RESOURCES WORKSPACE
          </span>

          <h1>Welcome back, {firstName}</h1>

          <p>
            Manage your workforce, support employees, and keep HR
            operations moving forward.
          </p>

          <div className="hr-welcome-date">
            <CalendarCheck size={16} />
            {today}
          </div>
        </div>

        <div className="hr-welcome-art" aria-hidden="true">
          <div className="hr-art-circle hr-art-circle-one" />
          <div className="hr-art-circle hr-art-circle-two" />
          <div className="hr-art-icon">
            <Users size={54} strokeWidth={1.4} />
          </div>
          <span className="hr-art-label">PEOPLE FIRST</span>
        </div>
      </section>

      <section className="hr-section">
        <div className="hr-section-heading">
          <div>
            <h2>Workforce overview</h2>
            <p>A snapshot of your organization's workforce</p>
          </div>
        </div>

        <div className="hr-stats-grid">
          <article className="hr-stat-card">
            <div className="hr-stat-top">
              <div className="hr-stat-icon blue">
                <Users size={21} />
              </div>
              <span className="hr-stat-label">PEOPLE</span>
            </div>
            <h3>
              {dashboardData?.totalEmployees ?? '—'}
            </h3>
            <p>Total employees</p>
          </article>

          <article className="hr-stat-card">
            <div className="hr-stat-top">
              <div className="hr-stat-icon purple">
                <Building2 size={21} />
              </div>
              <span className="hr-stat-label">STRUCTURE</span>
            </div>
            <h3>
              {dashboardData?.departmentCount ?? '—'}
            </h3>
            <p>Total departments</p>
          </article>

          <article className="hr-stat-card hr-stat-card-info">
            <div className="hr-stat-top">
              <div className="hr-stat-icon green">
                <UserRound size={21} />
              </div>
              <span className="hr-stat-label">HR OPERATIONS</span>
            </div>
            <h3>One workspace</h3>
            <p>People, hiring, and employee support</p>
          </article>
        </div>
      </section>

      <section className="hr-section">
        <div className="hr-section-heading">
          <div>
            <h2>HR quick actions</h2>
            <p>Navigate directly to your daily HR activities</p>
          </div>
        </div>

        <div className="hr-actions-grid">
          {shortcuts.map((item) => {
            const Icon = item.icon

            return (
              <button
                type="button"
                className="hr-action-card"
                key={item.page}
                onClick={() => onNavigate(item.page)}
              >
                <div className={`hr-action-icon ${item.tone}`}>
                  <Icon size={21} />
                </div>

                <div className="hr-action-copy">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <ArrowUpRight
                  className="hr-action-arrow"
                  size={18}
                />
              </button>
            )
          })}
        </div>
      </section>

      <section className="hr-section hr-department-section">
        <div className="hr-section-heading">
          <div>
            <h2>Department distribution</h2>
            <p>Employee count across registered departments</p>
          </div>

          <button
            type="button"
            className="hr-view-link"
            onClick={() => onNavigate('Departments')}
          >
            View departments <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="hr-department-card">
          {departmentChartData.length > 0 ? (
            departmentChartData.map((department) => (
              <div
                className="hr-department-row"
                key={department.month}
              >
                <div className="hr-department-info">
                  <span>{department.month}</span>
                  <strong>{department.employees}</strong>
                </div>

                <div className="hr-progress-track">
                  <div
                    className="hr-progress-fill"
                    style={{
                      width: `${Math.max(
                        3,
                        (Number(department.employees) / maxEmployees) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="hr-empty-state">
              <Building2 size={28} />
              <strong>No department data available</strong>
              <span>Department statistics will appear here when available.</span>
            </div>
          )}
        </div>
      </section>

      <footer className="hr-dashboard-footer">
        <span>IntelliHR · Human Resources</span>
        <span>People first. Progress together.</span>
      </footer>
    </div>
  )
}

export default HRDashboard
