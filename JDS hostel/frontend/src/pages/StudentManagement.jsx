import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Download, Edit3, Eye, Filter, LoaderCircle, Plus, Search, Trash2, UserRoundCheck, UserRoundX, X } from 'lucide-react'
import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import StudentForm from '../components/admin/StudentForm'
import StudentProfileModal from '../components/admin/StudentProfileModal'
import { createStudent, deactivateStudent, getStudent, getStudents, updateStudent, updateStudentStatus } from '../services/studentApi'

const initialFilters = { search: '', course: '', year: '', status: '' }

function StudentManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalStudents: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  const loadStudents = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getStudents({ ...filters, page, limit: 10 })
      setStudents(data.students)
      setPagination({ currentPage: data.currentPage, totalPages: data.totalPages, totalStudents: data.totalStudents })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load students. Check the backend connection.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])
const handleDelete = async (id) => {
    if (window.confirm("Kya aap is student ko delete karna chahte hain?")) {
      try {
        setIsLoading(true);
        await deactivateStudent(id);
        await loadStudents();
        setNotice('Student successfully deleted!');
      } catch (err) {
        setError('Failed to delete student');
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => loadStudents(), filters.search ? 350 : 0)
    return () => clearTimeout(timer)
  }, [filters.search, filters.course, filters.year, filters.status, loadStudents])

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function exportStudents() { const csv = [['Name','Student ID','Phone','Email','Course','Year','Room','Status'], ...students.map(s => [s.name,s.studentId,s.phone,s.email,s.course||'',s.year||'',s.room?.roomNumber||'',s.isActive?'Active':'Inactive'])].map(row => row.map(v => `"${String(v).replaceAll('\"','\"\"')}"`).join(',')).join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='jds-students.csv'; a.click(); URL.revokeObjectURL(a.href) }

  function clearFilters() {
    setFilters(initialFilters)
  }

  async function handleFormSubmit(payload) {
    setIsSaving(true)
    setError('')
    try {
      const result = modal.student ? await updateStudent(modal.student._id, payload) : await createStudent(payload)
      setModal(null)
      setNotice(result.message || 'Student saved successfully')
      await loadStudents(modal.student ? pagination.currentPage : 1)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save this student.')
    } finally {
      setIsSaving(false)
    }
  }

  async function openProfile(student) {
    setError('')
    try {
      const fullStudent = await getStudent(student._id)
      setModal({ type: 'profile', student: fullStudent })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load the student profile.')
    }
  }

  function openEdit(student) {
    setModal({ type: 'form', student })
  }

  async function confirmStatusChange() {
    const student = modal.student
    setModal(null)
    try {
      if (student.isActive) await deactivateStudent(student._id)
      else await updateStudentStatus(student._id, true)
      setNotice(`Student ${student.isActive ? 'deactivated' : 'activated'} successfully`)
      await loadStudents(pagination.currentPage)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update student status.')
    }
  }

  return <div className="admin-app">
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    <div className="admin-content"><Header onMenuClick={() => setSidebarOpen(true)} />
      <main className="student-main">
        <div className="student-page-intro"><div><p className="eyebrow">Residents</p><h1>Student management</h1><p>Manage hostel residents, profiles and enrollment information.</p></div><button className="primary-button" onClick={() => setModal({ type: 'form', student: null })}><Plus size={17} /> Add student</button></div>
        {notice && <div className="success-banner"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}
        {error && <div className="error-banner">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
        <section className="student-toolbar"><div className="student-search"><Search size={17} /><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search by name, ID, email or phone" /></div><div className="student-filters"><label><Filter size={15} /><select name="course" value={filters.course} onChange={updateFilter}><option value="">All courses</option><option value="B.Tech">B.Tech</option><option value="BBA">BBA</option><option value="MBA">MBA</option><option value="MCA">MCA</option></select></label><select name="year" value={filters.year} onChange={updateFilter}><option value="">All years</option>{[1, 2, 3, 4, 5].map((year) => <option key={year} value={year}>Year {year}</option>)}</select><select name="status" value={filters.status} onChange={updateFilter}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>{Object.values(filters).some(Boolean) && <button className="clear-filter" onClick={clearFilters}>Clear</button>}</div></section>
        <section className="student-table-panel panel"><div className="table-panel-heading"><div><h2>All students</h2><span>{pagination.totalStudents} total residents</span></div><button className="secondary-button" onClick={exportStudents} title="Export visible students"><Download size={15}/> Export CSV</button></div>
        {isLoading ? <div className="student-loading"><LoaderCircle className="spin" size={26} /><span>Loading student records...</span></div> : students.length === 0 ? <div className="student-empty"><span className="student-empty__icon"><Search size={23} /></span><h3>No students found</h3><p>Try adjusting your search or filters, or add the first resident.</p><button className="secondary-button" onClick={() => setModal({ type: 'form', student: null })}><Plus size={15} /> Add student</button></div> : <div className="student-table-scroll"><table className="student-table"><thead><tr><th>Student</th><th>Student ID</th><th>Phone</th><th>Course</th><th>Year</th><th>Room</th><th>Status</th><th>Joined</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{students.map((student) => <StudentRow key={student._id || student.id} student={student} onView={openProfile} onEdit={openEdit} onStatusChange={(item) => setModal({ type: 'confirm', student: item })} handleDelete={(id) => setModal({ type: 'confirm', student: students.find(s => (s._id || s.id) === id) })} />)}</tbody></table></div>}
          <div className="table-pagination"><span>Showing {students.length ? ((pagination.currentPage - 1) * 10) + 1 : 0}–{Math.min(pagination.currentPage * 10, pagination.totalStudents)} of {pagination.totalStudents}</span><div><button className="pagination-button" disabled={pagination.currentPage <= 1 || isLoading} onClick={() => loadStudents(pagination.currentPage - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button><span className="page-count">Page {pagination.currentPage} of {Math.max(pagination.totalPages, 1)}</span><button className="pagination-button" disabled={pagination.currentPage >= pagination.totalPages || isLoading} onClick={() => loadStudents(pagination.currentPage + 1)} aria-label="Next page"><ChevronRight size={15} /></button></div></div>
        </section>
      </main>
    </div>
    {modal?.type === 'form' && <StudentForm key={modal.student?._id || 'new-student'} student={modal.student} isSaving={isSaving} error={error} onClose={() => setModal(null)} onSubmit={handleFormSubmit} />}
    {modal?.type === 'profile' && <StudentProfileModal student={modal.student} onClose={() => setModal(null)} onEdit={(student) => openEdit(student)} />}
    {modal?.type === 'confirm' && <ConfirmationModal student={modal.student} onClose={() => setModal(null)} onConfirm={confirmStatusChange} />}
  </div>
}

function StudentRow({ student, onView, onEdit, onStatusChange, handleDelete }) {
  return (
    <tr>
      <td>
        <div className="table-student">
          <span className="avatar avatar--soft">{student.name ? student.name.charAt(0) : 'S'}</span>
          <div>
            <div className="font-medium text-gray-900">{student.name}</div>
            <div className="text-xs text-gray-500">{student.email}</div>
          </div>
        </div>
      </td>
      <td>{student.rollNumber || student.id}</td>
      <td>{student.course}</td>
      <td>{student.year}</td>
      <td>
        <span className={`status-badge ${student.isActive ? 'status-active' : 'status-inactive'}`}>
          {student.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="table-actions">
        <button className="table-icon-button" onClick={() => onView(student)} title="View student">
          <Eye size={15} />
        </button>
        <button className="table-icon-button" onClick={() => onEdit(student)} title="Edit student">
          <Edit3 size={15} />
        </button>
        <button
          type="button"
          onClick={() => handleDelete(student._id || student.id)}
          className="table-icon-button text-red-500 hover:text-red-700"
          title="Delete student"
        >
          <Trash2 size={15} />
        </button>
        <button 
          className="table-icon-button" 
          onClick={() => onStatusChange(student)} 
          title={student.isActive ? 'Deactivate' : 'Activate'}
        >
          <UserRoundCheck size={15} />
        </button>
      </td>
    </tr>
  )
}

function ConfirmationModal({ student, onClose, onConfirm }) {
  const active = student.isActive
  return <div className="modal-backdrop"><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span className={`confirm-icon ${active ? 'confirm-icon--rose' : 'confirm-icon--green'}`}>{active ? <UserRoundX size={23} /> : <UserRoundCheck size={23} />}</span><h2 id="confirm-title">{active ? 'Deactivate this student?' : 'Activate this student?'}</h2><p>{active ? `Are you sure you want to deactivate ${student.name}? The student record will be preserved and can be reactivated later.` : `Activate ${student.name} and include them in active resident lists?`}</p><div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className={`primary-button ${active ? 'danger-button' : ''}`} onClick={onConfirm}>{active ? 'Deactivate student' : 'Activate student'}</button></div></section></div>
}

function MoreIcon() {
  return <span className="more-dots"><i /><i /><i /></span>
}

export default StudentManagement