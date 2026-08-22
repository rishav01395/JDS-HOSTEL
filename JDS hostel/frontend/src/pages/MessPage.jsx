import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Edit3, LoaderCircle, Plus, RefreshCw, Utensils, X } from 'lucide-react'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import { createMenu, getMenus, updateMenu } from '../services/messApi'

const today = new Date().toISOString().slice(0, 10)
const emptyMenu = { date: today, day: new Date().toLocaleDateString('en-US', { weekday: 'long' }), breakfast: '', lunch: '', eveningSnacks: '', dinner: '', specialNote: '' }

function MessPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(null)

  async function load() { setLoading(true); setError(''); try { const start = new Date(); const end = new Date(); end.setDate(end.getDate() + 6); const result = await getMenus({ from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }); setMenus(result.menus) } catch (e) { setError(e.response?.data?.message || 'Unable to load mess menu.') } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  function change(e) { const { name, value } = e.target; setForm((current) => ({ ...current, [name]: value, ...(name === 'date' ? { day: new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }) } : {}) })) }
  async function submit(e) { e.preventDefault(); setError(''); try { const result = form._id ? await updateMenu(form._id, form) : await createMenu(form); setForm(null); setNotice(result.message); await load() } catch (err) { setError(err.response?.data?.message || 'Unable to save menu.') } }

  return <div className="admin-app"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}<div className="admin-content"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="student-main">
    <div className="student-page-intro"><div><p className="eyebrow">Daily operations</p><h1>Mess</h1><p>Publish and maintain the weekly hostel meal schedule.</p></div><button className="primary-button" onClick={() => setForm({ ...emptyMenu })}><Plus size={17} /> Add menu</button></div>
    {notice && <div className="success-banner"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}{error && <div className="error-banner">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
    <section className="mess-toolbar"><div><CalendarDays size={16} /><span>Next 7 days</span></div><button className="secondary-button" onClick={load}><RefreshCw size={15} /> Refresh</button></section>
    {loading ? <div className="student-loading"><LoaderCircle className="spin" size={26} /> Loading menu...</div> : menus.length === 0 ? <section className="panel student-empty"><span className="student-empty__icon"><Utensils size={23} /></span><h3>No menu published</h3><p>Add the first meal schedule to make the mess section useful.</p><button className="primary-button" onClick={() => setForm({ ...emptyMenu })}><Plus size={15} /> Add today's menu</button></section> : <div className="mess-grid">{menus.map((menu) => <article className="panel mess-card" key={menu._id}><div className="mess-card__heading"><div><p>{new Date(menu.date).toLocaleDateString('en-US', { weekday: 'long' })}</p><h2>{new Date(menu.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</h2></div><button className="table-icon-button" onClick={() => setForm({ ...menu, date: new Date(menu.date).toISOString().slice(0, 10) })} title="Edit menu"><Edit3 size={15} /></button></div><Meal label="Breakfast" value={menu.breakfast} /><Meal label="Lunch" value={menu.lunch} /><Meal label="Evening snacks" value={menu.eveningSnacks} /><Meal label="Dinner" value={menu.dinner} />{menu.specialNote && <div className="mess-note"><strong>Note</strong><span>{menu.specialNote}</span></div>}</article>)}</div>}
    {form && <MenuForm form={form} onChange={change} onSubmit={submit} onClose={() => setForm(null)} />}
  </main></div></div>
}

function Meal({ label, value }) { return <div className="meal-row"><span>{label}</span><strong>{value || 'Not added'}</strong></div> }
function MenuForm({ form, onChange, onSubmit, onClose }) { return <div className="modal-backdrop"><section className="form-modal"><div className="modal-header"><div><p className="eyebrow">Mess operations</p><h2>{form._id ? 'Edit menu' : 'Add menu'}</h2></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><form className="student-form" onSubmit={onSubmit}><div className="form-grid"><label>Date<input type="date" name="date" value={form.date} onChange={onChange} required /></label><label>Day<input name="day" value={form.day} onChange={onChange} readOnly /></label>{[['breakfast','Breakfast'],['lunch','Lunch'],['eveningSnacks','Evening snacks'],['dinner','Dinner']].map(([name,label]) => <label className="form-field--wide" key={name}>{label}<input name={name} value={form[name] || ''} onChange={onChange} placeholder={`Add ${label.toLowerCase()}`} /></label>)}<label className="form-field--wide">Special note<textarea name="specialNote" value={form.specialNote || ''} onChange={onChange} rows="3" placeholder="Optional: Sunday special, allergen note, etc." /></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save menu</button></div></form></section></div> }

export default MessPage
