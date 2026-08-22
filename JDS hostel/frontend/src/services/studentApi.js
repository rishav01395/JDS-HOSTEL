import api from './api'

export async function getStudents(params) {
  const { data } = await api.get('/students', { params })
  return data
}

export async function getStudent(id) {
  const { data } = await api.get(`/students/${id}`)
  return data.student
}

export async function createStudent(student) {
  const { data } = await api.post('/students', student)
  return data
}

export async function updateStudent(id, student) {
  const { data } = await api.put(`/students/${id}`, student)
  return data
}

export async function deactivateStudent(id) {
  const { data } = await api.delete(`/students/${id}`)
  return data
}

export async function updateStudentStatus(id, isActive) {
  const { data } = await api.patch(`/students/${id}/status`, { isActive })
  return data
}

export async function getStudentStats() {
  const { data } = await api.get('/students/stats/summary')
  return data
}