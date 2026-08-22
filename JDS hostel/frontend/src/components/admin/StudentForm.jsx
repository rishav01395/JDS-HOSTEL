import { useState } from 'react'
import { X } from 'lucide-react'

const emptyForm = {
  studentId: '', name: '', email: '', phone: '', alternatePhone: '', dateOfBirth: '', gender: '', address: '',
  guardianName: '', guardianPhone: '', course: '', college: '', year: '', joiningDate: '', leavingDate: '', room: '', bed: '', isActive: true,
}

function formatDate(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : ''
}

function studentToForm(student) {
  if (!student) return emptyForm
  return {
    ...emptyForm,
    ...student,
    dateOfBirth: formatDate(student.dateOfBirth),
    joiningDate: formatDate(student.joiningDate),
    leavingDate: formatDate(student.leavingDate),
    room: student.room?._id || student.room || '',
    bed: student.bed?._id || student.bed || '',
    year: student.year || '',
  }
}

function StudentForm({ student, isSaving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => studentToForm(student))

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function submit(event) {
    event.preventDefault()
    const payload = Object.fromEntries(Object.entries(form).filter(([key, value]) => value !== '' || key === 'isActive'))
    if (payload.year) payload.year = Number(payload.year)
    onSubmit(payload)
  }

  return <div className="modal-backdrop"><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="student-form-title">
    <div className="modal-header"><div><p className="eyebrow">{student ? 'Edit resident' : 'New resident'}</p><h2 id="student-form-title">{student ? 'Update student details' : 'Add a student'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close form"><X size={19} /></button></div>
    {error && <div className="form-error">{error}</div>}
    <form className="student-form" onSubmit={submit}>
      <fieldset><legend>Personal information</legend><div className="form-grid"><Field label="Full name" name="name" value={form.name} onChange={updateField} required /><Field label="Email" name="email" type="email" value={form.email} onChange={updateField} required /><Field label="Phone" name="phone" value={form.phone} onChange={updateField} required /><Field label="Alternate phone" name="alternatePhone" value={form.alternatePhone} onChange={updateField} /><Field label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} /><label>Gender<select name="gender" value={form.gender} onChange={updateField}><option value="">Select gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label><Field label="Address" name="address" value={form.address} onChange={updateField} wide /></div></fieldset>
      <fieldset><legend>Guardian information</legend><div className="form-grid"><Field label="Guardian name" name="guardianName" value={form.guardianName} onChange={updateField} /><Field label="Guardian phone" name="guardianPhone" value={form.guardianPhone} onChange={updateField} /></div></fieldset>
      <fieldset><legend>Academic information</legend><div className="form-grid"><Field label="Student ID" name="studentId" value={form.studentId} onChange={updateField} required /><Field label="College" name="college" value={form.college} onChange={updateField} /><Field label="Course" name="course" value={form.course} onChange={updateField} /><label>Year<select name="year" value={form.year} onChange={updateField}><option value="">Select year</option>{[1, 2, 3, 4, 5].map((year) => <option key={year} value={year}>Year {year}</option>)}</select></label></div></fieldset>
      <fieldset><legend>Hostel information</legend><div className="form-grid"><Field label="Joining date" name="joiningDate" type="date" value={form.joiningDate} onChange={updateField} required /><Field label="Leaving date" name="leavingDate" type="date" value={form.leavingDate} onChange={updateField} /><Field label="Room number or ID" name="room" value={form.room} onChange={updateField} placeholder="Optional, e.g. ACS" /><Field label="Bed number or ID" name="bed" value={form.bed} onChange={updateField} placeholder="Optional, e.g. A" /><label className="form-switch"><input type="checkbox" name="isActive" checked={form.isActive} onChange={updateField} /><span>Active student</span></label></div></fieldset>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button" disabled={isSaving}>{isSaving ? 'Saving...' : student ? 'Save changes' : 'Create student'}</button></div>
    </form>
  </section></div>
}

function Field({ label, name, value, onChange, type = 'text', required, wide, placeholder }) {
  return <label className={wide ? 'form-field--wide' : ''}>{label}{required && <span className="required-mark">*</span>}<input name={name} type={type} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} /></label>
}

export default StudentForm