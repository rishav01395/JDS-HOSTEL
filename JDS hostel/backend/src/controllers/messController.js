const mongoose = require('mongoose')
const MessMenu = require('../models/MessMenu')

async function listMenus(request, response, next) {
  try {
    const filter = {}
    if (request.query.from || request.query.to) {
      filter.date = {}
      if (request.query.from) filter.date.$gte = new Date(`${request.query.from}T00:00:00`)
      if (request.query.to) filter.date.$lte = new Date(`${request.query.to}T23:59:59.999`)
    }
    const menus = await MessMenu.find(filter).sort({ date: 1 }).lean()
    return response.json({ success: true, menus })
  } catch (error) { return next(error) }
}

async function createMenu(request, response, next) {
  try {
    const { date, day, breakfast, lunch, eveningSnacks, dinner, specialNote } = request.body
    if (!date || !day) return response.status(400).json({ success: false, message: 'Date and day are required' })
    const menu = await MessMenu.create({ date, day, breakfast, lunch, eveningSnacks, dinner, specialNote, createdBy: request.user.id })
    return response.status(201).json({ success: true, message: 'Mess menu saved successfully', menu })
  } catch (error) { return next(error) }
}

async function updateMenu(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ success: false, message: 'Invalid menu ID' })
    const allowed = ['date', 'day', 'breakfast', 'lunch', 'eveningSnacks', 'dinner', 'specialNote']
    const update = Object.fromEntries(Object.entries(request.body).filter(([key]) => allowed.includes(key)))
    const menu = await MessMenu.findByIdAndUpdate(request.params.id, update, { new: true, runValidators: true })
    if (!menu) return response.status(404).json({ success: false, message: 'Mess menu not found' })
    return response.json({ success: true, message: 'Mess menu updated successfully', menu })
  } catch (error) { return next(error) }
}

module.exports = { createMenu, listMenus, updateMenu }
