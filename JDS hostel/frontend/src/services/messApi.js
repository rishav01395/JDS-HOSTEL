import api from './api'

export async function getMenus(params = {}) { const { data } = await api.get('/mess/menus', { params }); return data }
export async function createMenu(menu) { const { data } = await api.post('/mess/menus', menu); return data }
export async function updateMenu(id, menu) { const { data } = await api.put(`/mess/menus/${id}`, menu); return data }
