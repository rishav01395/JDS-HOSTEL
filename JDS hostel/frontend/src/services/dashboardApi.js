import api from './api'

export async function getDashboard() {
  const { data } = await api.get('/management/dashboard')
  return data
}
