const express= require('express')
const { loginConstroller, registerController } = require('../controllers/userController')

//router object
const router =express.Router()

// routers 
//post|| login user
router.post('/login',loginConstroller)

// Post|| Register user
router.post('/register',registerController)

module.exports= router