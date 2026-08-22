import { X } from 'lucide-react'

function value(value, fallback = 'Not provided') {
  return value || fallback
}

function StudentProfileModal({ student, onClose, onEdit }) {
  return <div className="modal-backdrop"><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="student-profile-title">
    <div className="modal-header"><div><p className="eyebrow">Student profile</p><h2 id="student-profile-title">{student.name}</h2><p className="modal-subtitle">{student.studentId}</p></div><button className="icon-button" onClick={onClose} aria-label="Close profile"><X size={19} /></button></div>
    <div className="profile-hero"><span className="profile-avatar">{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>{student.name}</strong><span>{value(student.course, 'Course not set')} · {value(student.college, 'College not set')}</span></div><span className={`status-pill status-pill--${student.isActive ? 'green' : 'rose'}`}>{student.isActive ? 'Active' : 'Inactive'}</span></div>
    <div className="profile-sections"><InfoSection title="Contact information" items={[["Email", student.email], ['Phone', student.phone], ['Address', student.address]]} /><InfoSection title="Guardian information" items={[["Name", student.guardianName], ['Phone', student.guardianPhone]]} /><InfoSection title="Academic information" items={[["Student ID", student.studentId], ['Course', student.course], ['Year', student.year && `Year ${student.year}`], ['College', student.college]]} /><InfoSection title="Hostel information" items={[["Room", student.room?.roomNumber || 'Not allocated'], ['Bed', student.bed?.bedNumber || 'Not allocated'], ['Joined', student.joiningDate && new Date(student.joiningDate).toLocaleDateString()], ['Status', student.isActive ? 'Active' : 'Inactive']]} /></div>
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button" onClick={() => onEdit(student)}>Edit student</button></div>
  </section></div>
}

function InfoSection({ title, items }) {
  return <div className="profile-section"><h3>{title}</h3>{items.map(([label, item]) => <div className="profile-detail" key={label}><span>{label}</span><strong>{value(item)}</strong></div>)}</div>
}

export default StudentProfileModal