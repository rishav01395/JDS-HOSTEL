import api from './api'

export async function getComplaints(params = {}) { const { data } = await api.get('/complaints', { params }); return data }
export async function getComplaintStudents() { const { data } = await api.get('/complaints/students'); return data.students }
export async function createComplaint(complaint) { const { data } = await api.post('/complaints', complaint); return data }
export async function updateComplaint(id, complaint) { const { data } = await api.patch(`/complaints/${id}`, complaint); return data }
