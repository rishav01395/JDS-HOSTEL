const bcrypt = require('bcryptjs')

const Admin = require('../models/Admin')

async function ensureBootstrapAdmin() {
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || ''
  const name = (process.env.BOOTSTRAP_ADMIN_NAME || 'JDS Hostel Admin').trim()
  const phone = (process.env.BOOTSTRAP_ADMIN_PHONE || '0000000000').trim()

  if (!email || !password) {
    console.log('Bootstrap admin not configured; skipping automatic admin creation.')
    return null
  }

  const existingAdmin = await Admin.findOne({ email }).select('_id')
  if (existingAdmin) {
    return existingAdmin
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: 'admin',
    isActive: true,
  })

  console.log('Bootstrap admin created successfully')
  return admin
}

module.exports = ensureBootstrapAdmin
