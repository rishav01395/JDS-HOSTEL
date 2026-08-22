const express = require('express')
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware')
const { createMenu, listMenus, updateMenu } = require('../controllers/messController')

const router = express.Router()
const adminOnly = [authenticate, authorizeRoles('admin', 'superadmin')]

router.get('/menus', ...adminOnly, listMenus)
router.post('/menus', ...adminOnly, createMenu)
router.put('/menus/:id', ...adminOnly, updateMenu)

module.exports = router
