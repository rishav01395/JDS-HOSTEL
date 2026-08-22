import { ArrowUpRight, CheckCircle2, ChevronRight, Clock3, MoreHorizontal, Plus, ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import StatCard from '../components/admin/StatCard'
import { getDashboard } from '../services/dashboardApi'

function SectionHeading({ eyebrow, title, action }) {
  return <div className="section-heading"><div><span className="section-heading__eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div>
}

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No date'
const ageLabel = (value) => {
  if (!value) return 'No date'
  const diff = Math.max(0, Date.now() - new Date(value).getTime())
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
const methodLabel = (value) => ({ bankTransfer: 'Bank transfer', UPI: 'UPI', cash: 'Cash', online: 'Online', other: 'Other' }[value] || value || 'Unknown')

function EmptyState() { return <div className="empty-state">No data</div> }

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(setDashboard).catch(() => setDashboard(null)).finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    const s = dashboard?.stats
    return [
      { label: 'Total students', value: s ? String(s.totalStudents) : '0', detail: s ? `+${s.newStudentsThisMonth} this month` : 'No data', tone: 'teal', icon: 'users' },
      { label: 'Total rooms', value: s ? String(s.totalRooms) : '0', detail: s ? 'Actual rooms in database' : 'No data', tone: 'blue', icon: 'rooms' },
      { label: 'Occupied beds', value: s ? String(s.occupiedBeds) : '0', detail: s ? `${s.occupancyPercent}% occupancy` : 'No data', tone: 'amber', icon: 'beds' },
      { label: 'Available beds', value: s ? String(s.availableBeds) : '0', detail: 'Currently vacant', tone: 'green', icon: 'available' },
      { label: 'Pending fees', value: money(s?.pendingFees), detail: s ? `${s.pendingFeeStudents} students` : 'No data', tone: 'rose', icon: 'fees' },
      { label: 'Monthly revenue', value: money(s?.monthlyRevenue), detail: s?.revenueChange === null || s?.revenueChange === undefined ? 'No data' : `${s.revenueChange >= 0 ? '+' : ''}${s.revenueChange}% vs last month`, tone: 'violet', icon: 'revenue' },
      { label: 'Pending complaints', value: s ? String(s.pendingComplaints) : '0', detail: 'Pending + in progress', tone: 'orange', icon: 'complaints' },
    ]
  }, [dashboard])

  const feeOverview = dashboard?.feeCollection?.feeOverview || []
  const occupancy = dashboard?.occupancy || []
  const recentStudents = dashboard?.recentStudents || []
  const recentPayments = dashboard?.recentPayments || []
  const recentComplaints = dashboard?.recentComplaints || []
  const expected = dashboard?.feeCollection?.expected || 0
  const collected = dashboard?.feeCollection?.collected || 0
  const revenueChange = dashboard?.stats?.revenueChange

  return (
    <div className="admin-app">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <div className="admin-content">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-main">
          <div className="page-intro">
            <div><p className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p><h1>Good morning, administrator <span>✦</span></h1><p>Here is what is happening across JDS Hostel today.</p></div>
            <button className="primary-button" onClick={() => navigate('/admin/announcements')}><Plus size={17} /> Add announcement</button>
          </div>

          {loading && <div className="temporary-data-note">Loading live dashboard data…</div>}
          {!loading && !dashboard && <div className="temporary-data-note">Dashboard data could not be loaded. Check the backend/API connection.</div>}

          <section className="stats-grid" aria-label="Hostel statistics">
            {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </section>

          <div className="dashboard-grid dashboard-grid--top">
            <section className="panel fee-panel">
              <SectionHeading eyebrow="Finance" title="Fee collection overview" action={<button className="link-button" onClick={() => navigate('/admin/reports')}>View report <ChevronRight size={15} /></button>} />
              <div className="fee-panel__total"><strong>{money(expected)}</strong><span>Total expected this month</span><b>{revenueChange == null ? 'No data' : <><ArrowUpRight size={13} /> {revenueChange >= 0 ? '+' : ''}{revenueChange}%</>}</b></div>
              <div className="fee-bar">{feeOverview.map((item) => <div key={item.label} className={`fee-bar__segment fee-bar__segment--${item.tone}`} style={{ width: `${item.width}%` }} />)}</div>
              <div className="fee-legend">{feeOverview.map((item) => <div key={item.label}><span className={`legend-dot legend-dot--${item.tone}`} /><span>{item.label}</span><strong>{money(item.amount)}</strong></div>)}</div>
              {!feeOverview.length && <EmptyState />}
            </section>
            <section className="panel occupancy-panel">
              <SectionHeading eyebrow="Rooms" title="Room occupancy" action={<button className="icon-button" onClick={() => navigate('/admin/rooms')} title="Open room management"><MoreHorizontal size={19} /></button>} />
              <div className="occupancy-total"><strong>{dashboard?.stats?.occupancyPercent || 0}%</strong><span>overall occupancy</span><div className="occupancy-ring"><span>{dashboard?.stats?.occupiedBeds || 0}<span>/{(dashboard?.stats?.occupiedBeds || 0) + (dashboard?.stats?.availableBeds || 0) + (dashboard?.stats?.maintenanceBeds || 0)}</span></span></div></div>
              <div className="occupancy-list">{occupancy.map((item) => <div key={item.label} className="occupancy-row"><span>{item.label}</span><div className="progress-track"><span style={{ width: `${item.capacity ? (item.occupied / item.capacity) * 100 : 0}%` }} /></div><strong>{item.occupied}/{item.capacity}</strong></div>)}</div>
              {!occupancy.length && <EmptyState />}
            </section>
          </div>

          <div className="dashboard-grid dashboard-grid--bottom">
            <section className="panel table-panel">
              <SectionHeading eyebrow="Residents" title="Recent students" action={<button className="link-button" onClick={() => navigate('/admin/students')}>View all <ChevronRight size={15} /></button>} />
              <div className="student-list">{recentStudents.length ? recentStudents.map((student) => <div className="student-row" key={student.name + student.detail}><span className="avatar avatar--soft">{student.initials}</span><div><strong>{student.name}</strong><small>{student.detail}</small></div><span className={`status-pill status-pill--${student.tone}`}>{student.status}</span></div>) : <EmptyState />}</div>
            </section>
            <section className="panel table-panel">
              <SectionHeading eyebrow="Collections" title="Recent payments" action={<button className="link-button" onClick={() => navigate('/admin/payments')}>View all <ChevronRight size={15} /></button>} />
              <div className="payment-list">{recentPayments.length ? recentPayments.map((payment) => <div className="payment-row" key={payment.receipt + payment.date}><span className="payment-icon"><ReceiptText size={17} /></span><div><strong>{payment.name}</strong><small>{dateLabel(payment.date)} · {methodLabel(payment.method)}</small></div><div className="payment-row__amount"><strong>{money(payment.amount)}</strong><small>{payment.receipt}</small></div></div>) : <EmptyState />}</div>
            </section>
            <section className="panel table-panel complaints-panel">
              <SectionHeading eyebrow="Action needed" title="Recent complaints" action={<button className="link-button" onClick={() => navigate('/admin/complaints')}>View all <ChevronRight size={15} /></button>} />
              <div className="complaint-list">{recentComplaints.length ? recentComplaints.map((complaint) => <div className="complaint-row" key={complaint.title + complaint.createdAt}><span className={`priority-dot priority-dot--${complaint.tone}`} /><div><strong>{complaint.title}</strong><small>{complaint.student}</small></div><div className="complaint-row__age"><span className={`status-pill status-pill--${complaint.tone}`}>{complaint.priority}</span><small><Clock3 size={12} /> {ageLabel(complaint.createdAt)}</small></div></div>) : <EmptyState />}</div>
            </section>
          </div>
          <div className="dashboard-footer"><CheckCircle2 size={15} /> All systems operational <span>Live data · {money(collected)} collected this month</span></div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
