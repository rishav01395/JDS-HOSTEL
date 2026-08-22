import api from './api'
export async function getAnnouncements(params = {}) { const { data } = await api.get('/announcements', { params }); return data }
export async function createAnnouncement(payload) { const { data } = await api.post('/announcements', payload); return data }
export async function updateAnnouncement(id, payload) { const { data } = await api.put(`/announcements/${id}`, payload); return data }
export async function deleteAnnouncement(id) { const { data } = await api.delete(`/announcements/${id}`); return data }
