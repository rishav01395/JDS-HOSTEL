import { NavLink, useNavigate } from 'react-router-dom'
import {
  AlertCircle, BarChart3, BedDouble, Bell, ChevronLeft, CircleDollarSign,
  FileText, LayoutDashboard, LogOut, Megaphone, Settings, Utensils, Users,
} from 'lucide-react'
import { clearSession } from '../../services/auth'

const navigation = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', path: '/admin/students', icon: Users },
  { label: 'Rooms & beds', path: '/admin/rooms', icon: BedDouble },
  { label: 'Fees', path: '/admin/fees', icon: CircleDollarSign },
  { label: 'Payments', path: '/admin/payments', icon: FileText },
  { label: 'Complaints', path: '/admin/complaints', icon: AlertCircle },
  { label: 'Mess', path: '/admin/mess', icon: Utensils },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
]

const secondaryNavigation = [
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  function logout() {
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <div className="brand-mark">J</div>
        <div>
          <strong>JDS Hostel</strong>
          <span>Management system</span>
        </div>
        <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close menu">
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="sidebar__section-label">Workspace</div>
      <nav className="sidebar__nav" aria-label="Primary navigation">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__section-label sidebar__section-label--secondary">Manage</div>
      <nav className="sidebar__nav" aria-label="Management navigation">
        {secondaryNavigation.map(({ label, path, icon: Icon }) => (
          <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => isActive ? 'nav-link nav-link--active' : 'nav-link'}>
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__notice">
          <Bell size={16} />
          <div><strong>Need a hand?</strong><span>Check the admin guide</span></div>
        </div>
        <button className="logout-button" onClick={logout}><LogOut size={17} /> Logout</button>
      </div>
    </aside>
  )
}

export default Sidebar