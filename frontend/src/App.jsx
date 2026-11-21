
import { useEffect, useState } from 'react'
import Profile from './pages/Profile'
import SettingsPage from './pages/Settings'
import Performance from './pages/Performance'
import Recruitment from './pages/Recruitment'
import InterviewFeedback from './pages/InterviewFeedback'
import Onboarding from './pages/Onboarding'
import Documents from './pages/Documents'
import AuditLogs from './pages/AuditLogs'

import {
  LayoutDashboard, Users, Building2, CalendarCheck,
  ClipboardList, Wallet, TrendingUp, BriefcaseBusiness,
  Bell, ChevronDown, Plus, ArrowUpRight, MessageSquare, Sun, Moon,
  Clock3, CheckCircle2, Menu, X, FileText, Settings,
  LogOut, UserRound, CalendarDays, Check, Trash2,
  CheckCheck, BellRing, ShieldCheck, Bot
} from 'lucide-react'

import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

import './App.css'
import Login from './pages/Login'
import AIAssistant from './pages/AIAssistant'
import Employees from './pages/Employees'
import Departments from './pages/Departments'
import Attendance from './pages/Attendance'
import Leaves from './pages/Leaves'
import Payroll from './pages/Payroll'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AdminDashboard from './pages/AdminDashboard'
import HRDashboard from './pages/HRDashboard'
import api from './services/api'

const navigation = [
  {
    title: 'MAIN MENU',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard },
      { label: 'Employees', icon: Users },
      { label: 'Departments', icon: Building2 },
      { label: 'Attendance', icon: CalendarCheck },
      { label: 'Leave Management', icon: ClipboardList },
      { label: 'Payroll', icon: Wallet },
      { label: 'My Profile', icon: UserRound },
      { label: 'AI Assistant', icon: Bot },
    ]
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Performance', icon: TrendingUp },
      { label: 'Recruitment', icon: BriefcaseBusiness },
      { label: 'Onboarding', icon: UserRound },
      { label: 'Documents', icon: FileText },
      { label: 'Audit Logs', icon: ShieldCheck },
    ]
  },
]

const attendanceData = [
  { day: 'Mon', present: 85, absent: 15 },
  { day: 'Tue', present: 91, absent: 9 },
  { day: 'Wed', present: 88, absent: 12 },
  { day: 'Thu', present: 94, absent: 6 },
  { day: 'Fri', present: 82, absent: 18 },
]

const activities = [
  {
    name: 'Ananya Reddy',
    action: 'Joined the HR department',
    time: '10 minutes ago',
    initials: 'AR',
    color: 'purple'
  },
  {
    name: 'Rahul Sharma',
    action: 'Submitted a leave request',
    time: '35 minutes ago',
    initials: 'RS',
    color: 'blue'
  },
  {
    name: 'Priya Kumar',
    action: 'Completed onboarding',
    time: '1 hour ago',
    initials: 'PK',
    color: 'orange'
  },
  {
    name: 'Arjun Rao',
    action: 'Updated employee profile',
    time: '2 hours ago',
    initials: 'AR',
    color: 'green'
  },
]

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem('intellihr_user')
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

function getUserName(user) {
  if (!user) return 'User'

  return user.username ||
    user.name ||
    user.email?.split('@')[0] ||
    'User'
}

function getFirstName(user) {
  return getUserName(user).trim().split(/\s+/)[0]
}

function getRoleLabel(user) {
  const role = user?.role?.replace('ROLE_', '').toUpperCase()

  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'HR':
      return 'HR Manager'
    case 'EMPLOYEE':
      return 'Employee'
    default:
      return 'User'
  }
}

function getShortRole(user) {
  const role = user?.role?.replace('ROLE_', '').toUpperCase()

  switch (role) {
    case 'ADMIN':
      return 'Admin'
    case 'HR':
      return 'HR'
    case 'EMPLOYEE':
      return 'Employee'
    default:
      return 'User'
  }
}

function getInitials(user) {
  const name = getUserName(user).trim()

  if (!name) return 'U'

  const parts = name.split(/\s+/)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return name.substring(0, 2).toUpperCase()
}

function formatNotificationDate(dateValue) {
  if (!dateValue) return ''

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [navigationOrder, setNavigationOrder] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('intellihr_navigation_order') || '{}'
      )
    } catch {
      return {}
    }
  })

  const [draggedNavigationItem, setDraggedNavigationItem] = useState(null)

  useEffect(() => {
    localStorage.setItem(
      'intellihr_navigation_order',
      JSON.stringify(navigationOrder)
    )
  }, [navigationOrder])
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('intellihr_theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('intellihr_theme', theme)
  }, [theme])

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('intellihr_token'))
  )

  const [currentUser, setCurrentUser] = useState(getStoredUser)

  const [departmentChartData, setDepartmentChartData] = useState([])

  const [dashboardData, setDashboardData] = useState({
    totalEmployees: null,
    departmentCount: null,
  })

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationError, setNotificationError] = useState('')

  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const userRole = currentUser?.role?.replace('ROLE_', '').toUpperCase()
  const isManagementUser = ['ADMIN', 'HR'].includes(userRole)
  const isAdmin = userRole === 'ADMIN'

  const visibleNavigation = isManagementUser
    ? navigation.map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => item.label !== 'Audit Logs' || isAdmin
        )
      }))
    : [
        {
          title: 'MAIN MENU',
          items: [
            ...navigation[0].items.filter((item) =>
              [
                'Dashboard',
                'Attendance',
                'Leave Management',
                'Payroll',
                'My Profile',
                'Onboarding',
                'AI Assistant'
              ].includes(item.label)
            ),
            navigation[1].items.find(
              (item) => item.label === 'Performance'
            ),
            { label: 'Interview Feedback', icon: MessageSquare },
          ],
        },
      ]

  const orderedNavigation = visibleNavigation.map((group) => {
    const savedOrder = navigationOrder[group.title]
    const itemMap = new Map(
      group.items.map((item) => [item.label, item])
    )

    const savedItems = Array.isArray(savedOrder)
      ? savedOrder.map((label) => itemMap.get(label)).filter(Boolean)
      : []

    const savedLabels = new Set(savedItems.map((item) => item.label))
    const remainingItems = group.items.filter(
      (item) => !savedLabels.has(item.label)
    )

    return {
      ...group,
      items: [...savedItems, ...remainingItems],
    }
  })

  const handleNavigationDragStart = (event, groupTitle, itemLabel) => {
    setDraggedNavigationItem({ groupTitle, itemLabel })
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemLabel)
  }

  const handleNavigationDragOver = (event, groupTitle) => {
    event.preventDefault()

    if (draggedNavigationItem?.groupTitle === groupTitle) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleNavigationDrop = (event, groupTitle, targetLabel) => {
    event.preventDefault()

    if (!draggedNavigationItem ||
        draggedNavigationItem.groupTitle !== groupTitle ||
        draggedNavigationItem.itemLabel === targetLabel) {
      setDraggedNavigationItem(null)
      return
    }

    setNavigationOrder((currentOrder) => {
      const group = visibleNavigation.find(
        (item) => item.title === groupTitle
      )

      if (!group) return currentOrder

      const labels = group.items.map((item) => item.label)
      const fromIndex = labels.indexOf(draggedNavigationItem.itemLabel)
      const toIndex = labels.indexOf(targetLabel)

      if (fromIndex === -1 || toIndex === -1) return currentOrder

      const updatedLabels = [...labels]
      const [movedItem] = updatedLabels.splice(fromIndex, 1)
      updatedLabels.splice(toIndex, 0, movedItem)

      return {
        ...currentOrder,
        [groupTitle]: updatedLabels,
      }
    })

    setDraggedNavigationItem(null)
  }

  const handleNavigationDragEnd = () => {
    setDraggedNavigationItem(null)
  }

  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true)
      setNotificationError('')

      const [notificationsResponse, countResponse] = await Promise.all([
        api.get('/api/notifications/my'),
        api.get('/api/notifications/my/unread-count'),
      ])

      setNotifications(notificationsResponse.data)
      setUnreadCount(countResponse.data.unreadCount ?? 0)
    } catch (error) {
      console.error('Notification loading failed:', error)
      setNotificationError('Unable to load notifications. Please try again.')
    } finally {
      setNotificationsLoading(false)
    }
  }

  const loadPendingLeaveCount = async () => {
    try {
      const response = await api.get('/api/leaves')
      const requests = Array.isArray(response.data) ? response.data : []
      setPendingLeaveCount(
        requests.filter((leave) => leave.status === 'PENDING').length
      )
    } catch (error) {
      console.error('Pending leave count loading failed:', error)
      setPendingLeaveCount(0)
    }
  }
  useEffect(() => {
    let cancelled = false

    const loadDashboardData = async () => {
      try {
        const [employeesResponse, departmentsResponse] = await Promise.all([
          api.get('/api/employees/search', {
            params: { page: 0, size: 1 },
          }),
          api.get('/api/employees/department-statistics'),
        ])

        if (!cancelled) {
          setDashboardData({
            totalEmployees: employeesResponse.data.totalElements,
            departmentCount: departmentsResponse.data.length,
          })

          setDepartmentChartData(
            departmentsResponse.data.map((item) => ({
              month: item.department,
              employees: item.totalEmployees,
            }))
          )
        }
      } catch (error) {
        console.error('Dashboard data loading failed:', error)
      }
    }

    if (isAuthenticated) {
      if (isManagementUser) {
        loadDashboardData()
        loadPendingLeaveCount()
      }

      loadNotifications()
    }

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isManagementUser])

  const handleLogin = (userData) => {
    setCurrentUser(userData)
    setActivePage('Dashboard')
    setIsAuthenticated(true)
  }

  const handleNotificationToggle = async () => {
    const willOpen = !notificationOpen
    setNotificationOpen(willOpen)

    if (willOpen) {
      await loadNotifications()
    }
  }

  const handleMarkAsRead = async (notification) => {
    if (notification.read) return

    try {
      await api.patch(`/api/notifications/${notification.id}/read`)

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, read: true }
            : item
        )
      )

      setUnreadCount((previous) => Math.max(0, previous - 1))
    } catch (error) {
      console.error('Mark notification as read failed:', error)
      setNotificationError('Could not mark notification as read.')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/my/read-all')

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, read: true }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error('Mark all notifications as read failed:', error)
      setNotificationError('Could not update notifications.')
    }
  }

  const handleDeleteNotification = async (id) => {
    try {
      const notification = notifications.find((item) => item.id === id)

      await api.delete(`/api/notifications/${id}`)

      setNotifications((previous) =>
        previous.filter((item) => item.id !== id)
      )

      if (notification && !notification.read) {
        setUnreadCount((previous) => Math.max(0, previous - 1))
      }
    } catch (error) {
      console.error('Delete notification failed:', error)
      setNotificationError('Could not delete notification.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('intellihr_token')
    localStorage.removeItem('intellihr_user')

    setCurrentUser(null)
    setNotifications([])
    setUnreadCount(0)
    setNotificationOpen(false)
    setProfileMenuOpen(false)
    setIsAuthenticated(false)
    setActivePage('Dashboard')
  }

  const openProfilePage = () => {
    setActivePage('My Profile')
    setProfileMenuOpen(false)
    setNotificationOpen(false)
    setSidebarOpen(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const displayName = getUserName(currentUser)
  const firstName = getFirstName(currentUser)
  const roleLabel = getRoleLabel(currentUser)
  const shortRole = getShortRole(currentUser)
  const initials = getInitials(currentUser)
  const email = currentUser?.email || ''

  const stats = [
    {
      label: 'Total Employees',
      value: dashboardData.totalEmployees ?? '...',
      change: '+12.5%',
      icon: Users,
      tone: 'purple',
      note: 'vs last month'
    },
    {
      label: 'Departments',
      value: dashboardData.departmentCount ?? '...',
      change: '+2',
      icon: Building2,
      tone: 'blue',
      note: 'new departments'
    },
    {
      label: 'Present Today',
      value: '148',
      change: '86.0%',
      icon: CalendarCheck,
      tone: 'green',
      note: 'attendance rate'
    },
    {
      label: 'Pending Leaves',
      value: '08',
      change: 'Needs review',
      icon: ClipboardList,
      tone: 'orange',
      note: 'awaiting approval'
    },
  ]

  return (
    <div className="app-shell">

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>

        <div className="brand">
          <div className="brand-mark">
            <span>i</span>
          </div>

          <div>
            <h2>IntelliHR</h2>
            <p>PEOPLE MANAGEMENT</p>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-navigation">
          {orderedNavigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-heading">{group.title}</p>

              {group.items.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.label}
                    className={`nav-item ${
                      activePage === item.label ? 'active' : ''
                    }`}
                    draggable
                    onDragStart={(event) => handleNavigationDragStart(event, group.title, item.label)}
                    onDragOver={(event) => handleNavigationDragOver(event, group.title)}
                    onDrop={(event) => handleNavigationDrop(event, group.title, item.label)}
                    onDragEnd={handleNavigationDragEnd}
                    onClick={() => {
                      setActivePage(item.label)
                      setProfileMenuOpen(false)
                      setNotificationOpen(false)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                    <span>{item.label}</span>

                    {isManagementUser &&
                      item.label === 'Leave Management' &&
                      pendingLeaveCount > 0 && (
                        <span className="nav-count">{pendingLeaveCount}</span>
                      )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={() => setActivePage('Settings')}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <div className="sidebar-profile">
            <div className="profile-avatar">{initials}</div>

            <div className="profile-info">
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

      </aside>

      <main className="main-area">

        <header className="topbar">

          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-actions">

            

            <button
              className="theme-toggle"
              onClick={() => setTheme(previous => previous === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>

            <div className="notification-wrapper">

              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                aria-expanded={notificationOpen}
                onClick={handleNotificationToggle}
              >
                <Bell size={19} />

                {unreadCount > 0 && (
                  <span className="notification-count">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="notification-dropdown">

                  <div className="notification-header">
                    <div>
                      <h3>Notifications</h3>
                      <p>
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                          : 'You are all caught up'}
                      </p>
                    </div>

                    <button
                      className="notification-close"
                      onClick={() => setNotificationOpen(false)}
                      aria-label="Close notifications"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {unreadCount > 0 && (
                    <div className="notification-toolbar">
                      <button onClick={handleMarkAllAsRead}>
                        <CheckCheck size={14} />
                        Mark all as read
                      </button>
                    </div>
                  )}

                  {notificationError && (
                    <div className="notification-error">
                      {notificationError}
                      <button onClick={loadNotifications}>Retry</button>
                    </div>
                  )}

                  <div className="notification-list">

                    {notificationsLoading ? (
                      <div className="notification-empty">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="notification-empty">
                        <BellRing size={27} />
                        <strong>No notifications yet</strong>
                        <span>New updates will appear here.</span>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          className={`notification-item ${
                            notification.read ? 'is-read' : 'is-unread'
                          }`}
                          key={notification.id}
                        >
                          <div className="notification-icon">
                            <Bell size={16} />
                          </div>

                          <div className="notification-content">
                            <div className="notification-title-row">
                              <strong>{notification.title}</strong>

                              {!notification.read && (
                                <span className="unread-indicator" />
                              )}
                            </div>

                            <p>{notification.message}</p>

                            <div className="notification-meta">
                              <span>{notification.type}</span>
                              <time>
                                {formatNotificationDate(notification.createdAt)}
                              </time>
                            </div>

                            <div className="notification-actions">
                              {!notification.read && (
                                <button
                                  onClick={() => handleMarkAsRead(notification)}
                                >
                                  <Check size={13} />
                                  Mark as read
                                </button>
                              )}

                              <button
                                className="notification-delete"
                                onClick={() =>
                                  handleDeleteNotification(notification.id)
                                }
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                  </div>

                  <div className="notification-footer">
                    <span>
                      {notifications.length} notification{notifications.length === 1 ? '' : 's'}
                    </span>

                    <button onClick={loadNotifications}>
                      Refresh
                    </button>
                  </div>

                </div>
              )}

            </div>

            <div className="top-profile-wrapper">

              <button
                className="top-profile"
                onClick={() => setProfileMenuOpen((previous) => !previous)}
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                <div className="profile-avatar">{initials}</div>

                <div className="top-profile-info">
                  <strong>{displayName}</strong>
                  <span>{shortRole}</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">

                  <div className="profile-dropdown-header">
                    <strong>{displayName}</strong>
                    <span>{email}</span>
                    <span>{roleLabel}</span>
                  </div>

                  <button
                    className="profile-dropdown-profile"
                    onClick={openProfilePage}
                  >
                    <UserRound size={17} />
                    <span>My Profile</span>
                  </button>

                  <button
                    className="profile-dropdown-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    <span>Logout</span>
                  </button>

                </div>
              )}

            </div>

          </div>
        </header>

        <div className={activePage === 'Dashboard' && isAdmin ? 'dashboard-content admin-dashboard-host' : 'dashboard-content'}>

          {activePage === 'AI Assistant' ? (
            <AIAssistant user={currentUser} />
          ) : activePage === 'Settings' ? (
            <SettingsPage user={currentUser} theme={theme} setTheme={setTheme} />
          ) : activePage === 'Audit Logs' && isAdmin ? (
            <AuditLogs />
          ) : activePage === 'Performance' ? (
            <Performance />
          ) : activePage === 'Recruitment' && isManagementUser ? (
            <Recruitment />
          ) : activePage === 'Onboarding' ? (
            <Onboarding isManagementUser={isManagementUser} />
          ) : activePage === 'Documents' ? (
            <Documents isManagementUser={isManagementUser} />
          ) : activePage === 'Interview Feedback' && !isManagementUser ? (
            <InterviewFeedback />
          ) : activePage === 'My Profile' ? (
            <Profile user={currentUser} />
          ) : activePage === 'Dashboard' && isAdmin ? (
            <AdminDashboard
              user={currentUser}
              dashboardData={dashboardData}
              departmentChartData={departmentChartData}
              onNavigate={setActivePage}
            />
          ) : activePage === 'Dashboard' && userRole === 'HR' ? (
            <HRDashboard
              user={currentUser}
              dashboardData={dashboardData}
              departmentChartData={departmentChartData}
              onNavigate={setActivePage}
            />
          ) : activePage === 'Dashboard' && !isManagementUser ? (
            <EmployeeDashboard
              user={currentUser}
              notifications={notifications}
            />
          ) : activePage === 'Payroll' ? (
            <Payroll />
          ) : activePage === 'Leave Management' ? (
            <Leaves onLeavesUpdated={isManagementUser ? loadPendingLeaveCount : undefined} />
          ) : activePage === 'Attendance' ? (
            <Attendance />
          ) : activePage === 'Departments' && isManagementUser ? (
            <Departments isAdmin={isAdmin} />
          ) : activePage === 'Employees' && isManagementUser ? (
            <Employees isAdmin={isAdmin} />
          ) : (

            <>

              <section className="welcome-row">

                <div>
                  <p className="eyebrow">
                    {new Date().toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }).toUpperCase()}
                  </p>

                  <h1>
                    {activePage === 'Dashboard'
                      ? `Good morning, ${firstName}`
                      : activePage}
                  </h1>

                  <p className="welcome-subtitle">
                    {activePage === 'Dashboard'
                      ? "Here's what's happening across your organization today."
                      : `Welcome to IntelliHR ${activePage}. Select Dashboard to return to your overview.`}
                  </p>
                </div>

                {isManagementUser && (
                  <div className="welcome-actions">

                    <button className="secondary-button">
                      <CalendarDays size={17} />
                      This year
                      <ChevronDown size={15} />
                    </button>

                    <button className="primary-button">
                      <Plus size={18} />
                      Add Employee
                    </button>

                  </div>
                )}

              </section>

              {isManagementUser && (
                <>

                  <section className="stats-grid">

                    {stats.map((stat) => {
                      const Icon = stat.icon

                      return (
                        <article className="stat-card" key={stat.label}>

                          <div className="stat-top">
                            <div className={`stat-icon ${stat.tone}`}>
                              <Icon size={21} />
                            </div>

                            <span className={`stat-change ${stat.tone}`}>
                              {stat.change}
                            </span>
                          </div>

                          <p className="stat-label">{stat.label}</p>

                          <div className="stat-bottom">
                            <h2>{stat.value}</h2>
                            <span>{stat.note}</span>
                          </div>

                        </article>
                      )
                    })}

                  </section>

                  <section className="charts-grid">

                    <article className="panel employee-chart">

                      <div className="panel-header">
                        <div>
                          <h3>Department-wise Employees</h3>
                          <p>Employee distribution across departments</p>
                        </div>

                        <button className="chart-filter">
                          2026 <ChevronDown size={15} />
                        </button>
                      </div>

                      <div className="chart-legend">
                        <span className="legend-dot purple-dot" />
                        Total employees
                        <strong>{dashboardData.totalEmployees ?? '...'}</strong>
                      </div>

                      <div className="chart-container">

                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={departmentChartData}
                            barSize={55}
                            margin={{
                              top: 12,
                              right: 15,
                              left: -20,
                              bottom: 5
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="4 5"
                              vertical={false}
                              stroke="#edf0f5"
                            />

                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9299a8', fontSize: 12 }}
                              dy={10}
                            />

                            <YAxis
                              allowDecimals={false}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9299a8', fontSize: 12 }}
                            />

                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                border: '1px solid #edf0f5'
                              }}
                            />

                            <Bar
                              dataKey="employees"
                              name="Employees"
                              fill="#7562e9"
                              radius={[6, 6, 0, 0]}
                            />

                          </BarChart>
                        </ResponsiveContainer>

                      </div>

                    </article>

                    <article className="panel attendance-chart">

                      <div className="panel-header">
                        <div>
                          <h3>Attendance Overview</h3>
                          <p>Daily attendance percentage</p>
                        </div>

                        <button className="more-button">ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢</button>
                      </div>

                      <div className="attendance-summary">
                        <div>
                          <strong>86.0%</strong>
                          <span>Average attendance</span>
                        </div>

                        <span className="positive-change">
                          <ArrowUpRight size={15} /> 4.2%
                        </span>
                      </div>

                      <div className="chart-container attendance-bars">

                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={attendanceData}
                            barGap={5}
                            margin={{
                              top: 12,
                              right: 0,
                              left: -25,
                              bottom: 0
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="4 5"
                              vertical={false}
                              stroke="#edf0f5"
                            />

                            <XAxis
                              dataKey="day"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9299a8', fontSize: 12 }}
                              dy={9}
                            />

                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#9299a8', fontSize: 11 }}
                            />

                            <Tooltip
                              contentStyle={{
                                borderRadius: 12,
                                border: '1px solid #edf0f5'
                              }}
                            />

                            <Bar
                              dataKey="present"
                              fill="#36b98b"
                              radius={[5, 5, 0, 0]}
                            />

                            <Bar
                              dataKey="absent"
                              fill="#f2a65a"
                              radius={[5, 5, 0, 0]}
                            />

                          </BarChart>
                        </ResponsiveContainer>

                      </div>

                      <div className="bar-legend">
                        <span>
                          <i className="present-dot" /> Present
                        </span>

                        <span>
                          <i className="absent-dot" /> Absent
                        </span>
                      </div>

                    </article>

                  </section>

                  <section className="bottom-grid">

                    <article className="panel activity-panel">

                      <div className="panel-header">
                        <div>
                          <h3>Recent Activity</h3>
                          <p>Latest updates from your organization</p>
                        </div>

                        <button className="text-button">
                          View all <ArrowUpRight size={15} />
                        </button>
                      </div>

                      <div className="activity-list">

                        {activities.map((activity, index) => (
                          <div className="activity-item" key={index}>

                            <div className={`activity-avatar ${activity.color}`}>
                              {activity.initials}
                            </div>

                            <div className="activity-description">
                              <strong>{activity.name}</strong>
                              <span>{activity.action}</span>
                            </div>

                            <time>{activity.time}</time>

                          </div>
                        ))}

                      </div>

                    </article>

                    <article className="panel tasks-panel">

                      <div className="panel-header">
                        <div>
                          <h3>Today's Overview</h3>
                          <p>Quick operational summary</p>
                        </div>

                        <button className="more-button">ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢</button>
                      </div>

                      <div className="task-row">
                        <div className="task-icon green">
                          <CheckCircle2 size={19} />
                        </div>

                        <div>
                          <strong>Attendance marked</strong>
                          <span>148 employees present</span>
                        </div>

                        <span className="task-status done">Updated</span>
                      </div>

                      <div className="task-row">
                        <div className="task-icon orange">
                          <Clock3 size={19} />
                        </div>

                        <div>
                          <strong>Leave approvals</strong>
                          <span>8 requests pending</span>
                        </div>

                        <span className="task-status pending">Pending</span>
                      </div>

                      <div className="task-row">
                        <div className="task-icon purple">
                          <Users size={19} />
                        </div>

                        <div>
                          <strong>New employees</strong>
                          <span>3 onboarding tasks</span>
                        </div>

                        <span className="task-status new">New</span>
                      </div>

                    </article>

                  </section>

                </>
              )}

              <footer className="dashboard-footer">
                <span>ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© 2026 IntelliHR. All rights reserved.</span>
                <span>People first. Progress together.</span>
              </footer>

            </>
          )}

        </div>

      </main>

    </div>
  )
}

export default App








