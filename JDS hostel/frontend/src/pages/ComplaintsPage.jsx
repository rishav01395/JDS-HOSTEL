import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Eye, Filter, LoaderCircle, Plus, RefreshCw, X } from 'lucide-react'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import { createComplaint, getComplaintStudents, getComplaints, updateComplaint } from '../services/complaintApi'

const emptyForm = { student: '', title: '', description: '', category: 'room', priority: 'medium' }
const statuses = { pending: 'amber', inProgress: 'blue', resolved: 'green', rejected: 'rose' }

function ComplaintsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [students, setStudents] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(null)

  async function load() {
    setLoading(true); setError('')
    try { const [result, studentList] = await Promise.all([getComplaints(status ? { status } : {}), getComplaintStudents()]); setComplaints(result.complaints); setStudents(studentList) }
    catch (e) { setError(e.response?.data?.message || 'Unable to load complaints.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [status])
  function change(e) { setForm((current) => ({ ...current, [e.target.name]: e.target.value })) }
  async function submit(e) { e.preventDefault(); setError(''); try { const result = await createComplaint(form); setForm(null); setNotice(result.message); await load() } catch (err) { setError(err.response?.data?.message || 'Unable to create complaint.') } }
  async function changeStatus(complaint, nextStatus) { setError(''); try { const result = await updateComplaint(complaint._id, { status: nextStatus }); setNotice(result.message); await load() } catch (err) { setError(err.response?.data?.message || 'Unable to update complaint.') } }

  return <div className="admin-app"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}<div className="admin-content"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="student-main">
    <div className="student-page-intro"><div><p className="eyebrow">Resident support</p><h1>Complaints</h1><p>Track resident issues from submission to resolution.</p></div><button className="primary-button" onClick={() => setForm({ ...emptyForm, student: students[0]?._id || '' })}><Plus size={17} /> New complaint</button></div>
    {notice && <div className="success-banner"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}{error && <div className="error-banner">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
    <section className="student-toolbar"><div className="student-filters"><label><Filter size={15} /><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="pending">Pending</option><option value="inProgress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label><button className="clear-filter" onClick={load}><RefreshCw size={13} /> Refresh</button></div></section>
    <section className="panel student-table-panel"><div className="table-panel-heading"><div><h2>Complaint queue</h2><span>{complaints.length} records</span></div></div>{loading ? <div className="student-loading"><LoaderCircle className="spin" size={26} /> Loading complaints...</div> : complaints.length === 0 ? <div className="student-empty"><span className="student-empty__icon"><AlertCircle size={23} /></span><h3>No complaints found</h3><p>New resident complaints will appear here.</p><button className="secondary-button" onClick={() => setForm({ ...emptyForm, student: students[0]?._id || '' })}><Plus size={15} /> Create complaint</button></div> : <div className="student-table-scroll"><table className="student-table"><thead><tr><th>Complaint</th><th>Student</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th><th>Update</th></tr></thead><tbody>{complaints.map((item) => <tr key={item._id}><td><strong>{item.title}</strong><small className="muted-cell">{item.description}</small></td><td>{item.student?.name || 'Unknown'}<small className="muted-cell">{item.student?.studentId || '—'}</small></td><td>{item.category}</td><td><span className={`status-pill status-pill--${item.priority === 'urgent' ? 'rose' : item.priority === 'high' ? 'amber' : 'blue'}`}>{item.priority}</span></td><td><span className={`status-pill status-pill--${statuses[item.status] || 'blue'}`}>{item.status === 'inProgress' ? 'In progress' : item.status}</span></td><td className="muted-cell">{new Date(item.createdAt).toLocaleDateString()}</td><td><select className="inline-select" value={item.status} onChange={(e) => changeStatus(item, e.target.value)}><option value="pending">Pending</option><option value="inProgress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></td></tr>)}</tbody></table></div>}</section>
    {form && <ComplaintForm form={form} students={students} onChange={change} onSubmit={submit} onClose={() => setForm(null)} />}
  </main></div></div>
}

function ComplaintForm({ form, students, onChange, onSubmit, onClose }) { return <div className="modal-backdrop"><section className="form-modal"><div className="modal-header"><div><p className="eyebrow">Resident support</p><h2>New complaint</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><form className="student-form" onSubmit={onSubmit}><div className="form-grid"><label>Student<select name="student" value={form.student} onChange={onChange} required><option value="">Select student</option>{students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}</select></label><label>Category<select name="category" value={form.category} onChange={onChange}>{['room','electricity','water','mess','cleanliness','maintenance','security','other'].map((v) => <option key={v}>{v}</option>)}</select></label><label>Priority<select name="priority" value={form.priority} onChange={onChange}>{['low','medium','high','urgent'].map((v) => <option key={v}>{v}</option>)}</select></label><label className="form-field--wide">Title<input name="title" value={form.title} onChange={onChange} required placeholder="e.g. Bathroom tap leaking" /></label><label className="form-field--wide">Description<textarea name="description" value={form.description} onChange={onChange} required rows="5" placeholder="Describe the issue and where it is happening." /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save complaint</button></div></form></section></div> }

export default ComplaintsPage
