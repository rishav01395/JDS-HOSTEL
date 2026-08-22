import { useEffect, useState } from 'react'
import { BedDouble, CheckCircle2, CircleDollarSign, CreditCard, Plus, RefreshCw, X, QrCode } from 'lucide-react'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import { createFee, createPayment, createRoom, getFees, getManagementStudents, getPayments, getRooms, updateBed } from '../services/managementApi'
import { getSettings } from '../services/settingsApi'

const emptyRoom = { roomNumber: '', floor: 0, roomType: 'double', capacity: 2, description: '' }
const emptyFee = { student: '', amount: '', feeType: 'monthly', dueDate: '', description: '' }
const emptyPayment = { fee: '', amount: '', paymentMethod: 'UPI', paymentDate: new Date().toISOString().slice(0, 10), transactionId: '', receiptNumber: '', notes: '' }

function ManagementPage({ section }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [data, setData] = useState({ rooms: [], fees: [], payments: [], students: [] })
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [upi, setUpi] = useState(null)
  const [showQr, setShowQr] = useState(false)

  async function load() {
    setLoading(true); setError('')
    try {
      if (section === 'rooms') { const result = await getRooms(); setData((current) => ({ ...current, rooms: result.rooms })) }
      if (section === 'fees') { const [fees, students] = await Promise.all([getFees(), getManagementStudents()]); setData((current) => ({ ...current, fees: fees.fees, students })) }
      if (section === 'payments') { const [payments, fees] = await Promise.all([getPayments(), getFees()]); setData((current) => ({ ...current, payments: payments.payments, fees: fees.fees })) }
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to load this section.') } finally { setLoading(false) }
  }

  useEffect(() => { load(); getSettings().then((r) => setUpi(r.settings)).catch(() => {}) }, [section])

  function update(event) { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }

  async function submit(event) {
    event.preventDefault(); setError('')
    try {
      let result
      if (section === 'rooms') result = await createRoom({ ...form, floor: Number(form.floor), capacity: Number(form.capacity) })
      if (section === 'fees') result = await createFee({ ...form, amount: Number(form.amount) })
      if (section === 'payments') result = await createPayment({ ...form, amount: Number(form.amount) })
      setForm(null); setNotice(result.message); await load()
    } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to save this record.') }
  }

  async function toggleBed(bed) {
    try { await updateBed(bed._id, { status: bed.status === 'maintenance' ? 'available' : 'maintenance' }); setNotice('Bed status updated'); await load() } catch (requestError) { setError(requestError.response?.data?.message || 'Unable to update bed.') }
  }

  const title = section === 'rooms' ? 'Rooms & beds' : section[0].toUpperCase() + section.slice(1)
  return <div className="admin-app"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />{sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}<div className="admin-content"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="student-main">
    <div className="student-page-intro"><div><p className="eyebrow">Operations</p><h1>{title}</h1><p>{section === 'rooms' ? 'Manage rooms, capacity, beds and maintenance status.' : section === 'fees' ? 'Assign charges to residents and track outstanding balances.' : 'Record collections and keep fee balances up to date.'}</p></div><div className="row-actions">{section === 'payments' && <button className="secondary-button" onClick={() => setShowQr(true)}><QrCode size={15}/> Payment QR</button>}<button className="primary-button" onClick={() => setForm(section === 'rooms' ? { ...emptyRoom } : section === 'fees' ? { ...emptyFee } : { ...emptyPayment })}><Plus size={17} /> {section === 'rooms' ? 'Add room' : section === 'fees' ? 'Add fee' : 'Record payment'}</button></div></div>
    {notice && <div className="success-banner"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}{error && <div className="error-banner">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
    {loading ? <div className="student-loading"><RefreshCw className="spin" size={24} /> Loading records...</div> : section === 'rooms' ? <Rooms rooms={data.rooms} onToggle={toggleBed} /> : section === 'fees' ? <Fees fees={data.fees} /> : <Payments payments={data.payments} />}
    {form && <FormModal section={section} form={form} students={data.students} fees={data.fees} onChange={update} onSubmit={submit} onClose={() => setForm(null)} />}
  </main>{showQr && <QrModal settings={upi} onClose={() => setShowQr(false)} />}</div></div>
}

function Rooms({ rooms, onToggle }) { return <section className="panel student-table-panel"><div className="table-panel-heading"><div><h2>Room inventory</h2><span>{rooms.length} rooms</span></div></div>{rooms.length === 0 ? <Empty text="No rooms created yet." /> : <div className="room-grid">{rooms.map((room) => <article className="room-card" key={room._id}><div className="room-card__heading"><div><strong>Room {room.roomNumber}</strong><span>Floor {room.floor} · {room.roomType}</span></div><span className={`status-pill status-pill--${room.status === 'maintenance' ? 'rose' : room.status === 'full' ? 'amber' : 'green'}`}>{room.status}</span></div><div className="room-card__capacity"><span>{room.beds.filter((bed) => bed.status === 'occupied').length}/{room.capacity} occupied</span><span>{room.beds.filter((bed) => bed.status === 'available').length} available</span></div><div className="bed-list">{room.beds.map((bed) => <button className={`bed-chip bed-chip--${bed.status}`} key={bed._id} onClick={() => onToggle(bed)} title="Toggle maintenance status"><BedDouble size={14} />{bed.bedNumber}<small>{bed.student?.name || bed.status}</small></button>)}</div></article>)}</div>}</section> }
function Fees({ fees }) { return <Table title="Fee ledger" count={`${fees.length} fees`} headers={['Student', 'Type', 'Amount', 'Paid', 'Balance', 'Due', 'Status']} rows={fees.map((fee) => [fee.student?.name || 'Unknown', fee.feeType, `₹${fee.amount}`, `₹${fee.paidAmount}`, `₹${fee.remainingAmount}`, new Date(fee.dueDate).toLocaleDateString(), fee.status])} empty="No fees created yet." /> }
function Payments({ payments }) { return <Table title="Payment ledger" count={`${payments.length} payments`} headers={['Student', 'Fee', 'Amount', 'Method', 'Date', 'Receipt']} rows={payments.map((payment) => [payment.student?.name || 'Unknown', payment.fee?.feeType || 'Fee', `₹${payment.amount}`, payment.paymentMethod, new Date(payment.paymentDate).toLocaleDateString(), payment.receiptNumber || '—'])} empty="No payments recorded yet." /> }
function Table({ title, count, headers, rows, empty }) { return <section className="panel student-table-panel"><div className="table-panel-heading"><div><h2>{title}</h2><span>{count}</span></div></div>{rows.length === 0 ? <Empty text={empty} /> : <div className="student-table-scroll"><table className="student-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cellIndex === row.length - 1 ? <span className="status-pill status-pill--green">{cell}</span> : cell}</td>)}</tr>)}</tbody></table></div>}</section> }
function Empty({ text }) { return <div className="student-empty"><span className="student-empty__icon"><CircleDollarSign size={23} /></span><h3>{text}</h3></div> }
function FormModal({ section, form, students, fees, onChange, onSubmit, onClose }) { const isRoom = section === 'rooms'; const isFee = section === 'fees'; return <div className="modal-backdrop"><section className="form-modal"><div className="modal-header"><div><p className="eyebrow">New record</p><h2>{isRoom ? 'Add a room' : isFee ? 'Create a fee' : 'Record a payment'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div><form className="student-form" onSubmit={onSubmit}><div className="form-grid">{isRoom ? <><Field label="Room number" name="roomNumber" value={form.roomNumber} onChange={onChange} required /><Field label="Floor" name="floor" type="number" value={form.floor} onChange={onChange} required /><label>Room type<select name="roomType" value={form.roomType} onChange={onChange}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option><option value="fourSharing">Four sharing</option></select></label><Field label="Capacity" name="capacity" type="number" value={form.capacity} onChange={onChange} required /></> : isFee ? <><Select label="Student" name="student" value={form.student} onChange={onChange} options={students.map((student) => [student._id, `${student.name} (${student.studentId})`])} /><Field label="Amount" name="amount" type="number" value={form.amount} onChange={onChange} required /><label>Fee type<select name="feeType" value={form.feeType} onChange={onChange}>{['monthly', 'admission', 'security', 'electricity', 'mess', 'other'].map((type) => <option key={type}>{type}</option>)}</select></label><Field label="Due date" name="dueDate" type="date" value={form.dueDate} onChange={onChange} required /></> : <><Select label="Fee" name="fee" value={form.fee} onChange={onChange} options={fees.filter((fee) => fee.remainingAmount > 0).map((fee) => [fee._id, `${fee.student?.name} · ${fee.feeType} · ₹${fee.remainingAmount}`])} /><Field label="Amount" name="amount" type="number" value={form.amount} onChange={onChange} required /><label>Payment method<select name="paymentMethod" value={form.paymentMethod} onChange={onChange}>{['cash', 'UPI', 'bankTransfer', 'online', 'other'].map((method) => <option key={method}>{method}</option>)}</select></label><Field label="Receipt number" name="receiptNumber" value={form.receiptNumber} onChange={onChange} /><Field label="Payment date" name="paymentDate" type="date" value={form.paymentDate} onChange={onChange} /></>}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save record</button></div></form></section></div> }
function Field({ label, name, value, onChange, type = 'text', required }) { return <label>{label}<input name={name} type={type} value={value || ''} onChange={onChange} required={required} /></label> }
function QrModal({ settings, onClose }) { const uri = settings?.upiId ? `upi://pay?pa=${settings.upiId}&pn=${settings.upiName || settings.hostelName || 'JDS Hostel'}&cu=INR` : ''; return <div className="modal-backdrop"><section className="confirm-modal"><button className="icon-button" style={{float:'right'}} onClick={onClose}><X size={18}/></button><QrCode size={34}/><h2>Hostel payment QR</h2>{uri ? <><img alt="UPI payment QR" style={{width:220,height:220,margin:'15px auto',display:'block'}} src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(uri)}`}/><p>UPI ID: {settings.upiId}</p></> : <p>Set the UPI ID in Settings first. The QR will then be generated automatically.</p>}<div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button></div></section></div> }
function Select({ label, name, value, onChange, options }) { return <label>{label}<select name={name} value={value} onChange={onChange} required><option value="">Select...</option>{options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}</select></label> }

export default ManagementPage