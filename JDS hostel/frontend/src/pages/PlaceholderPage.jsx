import { ArrowLeft, Construction } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import { useState } from 'react'

const pageNames = { students: 'Students', rooms: 'Rooms & beds', fees: 'Fees', payments: 'Payments', complaints: 'Complaints', mess: 'Mess', announcements: 'Announcements', reports: 'Reports', settings: 'Settings' }

function PlaceholderPage() {
  const { section } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const title = pageNames[section] || 'Workspace'

  return <div className="admin-app"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}<div className="admin-content"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="placeholder-main"><div className="placeholder-card"><span className="placeholder-card__icon"><Construction size={27} /></span><p className="eyebrow">{title}</p><h1>We are preparing this workspace.</h1><p>The {title.toLowerCase()} workflow will be available in a later development step.</p><button className="secondary-button" onClick={() => navigate('/admin/dashboard')}><ArrowLeft size={16} /> Back to dashboard</button></div></main></div></div>
}

export default PlaceholderPage