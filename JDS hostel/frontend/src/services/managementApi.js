import api from './api'

export async function getRooms() { const { data } = await api.get('/management/rooms'); return data }
export async function createRoom(room) { const { data } = await api.post('/management/rooms', room); return data }
export async function updateRoom(id, room) { const { data } = await api.put(`/management/rooms/${id}`, room); return data }
export async function updateBed(id, bed) { const { data } = await api.patch(`/management/beds/${id}`, bed); return data }
export async function getManagementStudents() { const { data } = await api.get('/management/students'); return data.students }
export async function getFees() { const { data } = await api.get('/management/fees'); return data }
export async function createFee(fee) { const { data } = await api.post('/management/fees', fee); return data }
export async function getPayments() { const { data } = await api.get('/management/payments'); return data }
export async function createPayment(payment) { const { data } = await api.post('/management/payments', payment); return data }