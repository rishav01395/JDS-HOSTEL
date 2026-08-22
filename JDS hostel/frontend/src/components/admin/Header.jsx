import { Bell, Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getStoredAdmin } from '../../services/auth'
function Header({ onMenuClick }) {
  const admin = getStoredAdmin(); const navigate = useNavigate(); const initials = admin?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'AD'
  function search(event){ if(event.key !== 'Enter') return; const q=event.currentTarget.value.toLowerCase(); const map=[['student','/admin/students'],['room','/admin/rooms'],['bed','/admin/rooms'],['fee','/admin/fees'],['payment','/admin/payments'],['complaint','/admin/complaints'],['mess','/admin/mess'],['announce','/admin/announcements'],['report','/admin/reports'],['setting','/admin/settings']]; const hit=map.find(([word])=>q.includes(word)); if(hit) navigate(hit[1]) }
  return <header className="topbar"><button className="icon-button topbar__menu" onClick={onMenuClick} aria-label="Open menu"><Menu size={21}/></button><div className="topbar__search"><Search size={18}/><input aria-label="Search" placeholder="Search students, rooms, fees..." onKeyDown={search}/><kbd>Enter</kbd></div><div className="topbar__actions"><button className="icon-button notification-button" aria-label="Open announcements" onClick={()=>navigate('/admin/announcements')}><Bell size={19}/><span/></button><div className="topbar__divider"/><button className="profile-button" onClick={()=>navigate('/admin/settings')}><span className="avatar">{initials}</span><span className="profile-button__copy"><strong>{admin?.name||'Administrator'}</strong><small>{admin?.role||'Admin'}</small></span><span className="profile-button__chevron">⌄</span></button></div></header>
}
export default Header
