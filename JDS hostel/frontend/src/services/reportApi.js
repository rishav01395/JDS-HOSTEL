import api from './api'
export async function getReportSummary() { const { data } = await api.get('/reports/summary'); return data }
