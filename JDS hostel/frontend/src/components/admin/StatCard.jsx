import { ArrowDownRight, ArrowUpRight, BedDouble, Building2, CircleDollarSign, CreditCard, MessageCircle, Users, WalletCards } from 'lucide-react'

const icons = { users: Users, rooms: Building2, beds: BedDouble, available: BedDouble, fees: CircleDollarSign, revenue: WalletCards, complaints: MessageCircle }

function StatCard({ label, value, detail, tone, icon }) {
  const Icon = icons[icon] || CreditCard
  const isPositive = detail.includes('+')

  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}><Icon size={19} /></div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      <div className={`stat-card__detail ${isPositive ? 'stat-card__detail--positive' : ''}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{detail}
      </div>
    </article>
  )
}

export default StatCard