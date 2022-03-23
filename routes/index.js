var express = require('express')
var router = express.Router()

const userController = require('../controllers/userController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {})
})

/* GET login page. */
router.get('/login', userController.user_login_get)

/* POST login auth page */
router.post(
  '/login',
  userController.user_login_post,
  userController.user_login_auth_post
)

/* GET register page. */
router.get('/register', userController.user_register_get)

/* POST register page. */
router.post('/register', userController.user_register_post)

module.exports = router
