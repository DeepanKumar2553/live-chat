const express = require('express')
const Router = express.Router()
const { signUpController, loginController, fetchAllUsersController } = require('../controllers/users')
const authMiddleware = require('../middleware/authMiddleware')

Router.post('/signup', signUpController)
Router.post('/login', loginController)
Router.get('/fetchUsers', authMiddleware, fetchAllUsersController)

module.exports = Router