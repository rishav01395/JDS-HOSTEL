const HostelSetting = require('../models/HostelSetting')
const NotificationLog = require('../models/NotificationLog')

function normalizePhone(value) {
  const raw = String(value || '').trim().replace(/\s|-/g, '')
  if (/^\d{10}$/.test(raw)) return `+91${raw}`
  if (/^91\d{10}$/.test(raw)) return `+${raw}`
  return raw
}

async function sendSms({ to, message, student, payment }) {
  to = normalizePhone(to)
  const settings = await HostelSetting.findOne({ key: 'global' }).select('+twilioAuthToken').lean()
  if (!settings?.smsEnabled) {
    await NotificationLog.create({ type: 'sms', recipient: to, message, status: 'skipped', student, payment })
    return { sent: false, skipped: true, reason: 'SMS is disabled in Settings' }
  }
  if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioFromNumber) {
    await NotificationLog.create({ type: 'sms', recipient: to, message, status: 'failed', error: 'Twilio credentials are incomplete', student, payment })
    return { sent: false, skipped: false, reason: 'Twilio settings are incomplete' }
  }
  try {
    const body = new URLSearchParams({ To: to, From: settings.twilioFromNumber, Body: message })
    const auth = Buffer.from(`${settings.twilioAccountSid}:${settings.twilioAuthToken}`).toString('base64')
    const result = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountSid}/Messages.json`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    const payload = await result.json()
    if (!result.ok) throw new Error(payload.message || 'Twilio rejected the SMS')
    await NotificationLog.create({ type: 'sms', recipient: to, message, status: 'sent', student, payment })
    return { sent: true, sid: payload.sid }
  } catch (error) {
    await NotificationLog.create({ type: 'sms', recipient: to, message, status: 'failed', error: error.message, student, payment })
    return { sent: false, skipped: false, reason: error.message }
  }
}

module.exports = { sendSms }
