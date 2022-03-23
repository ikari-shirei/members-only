const User = require('../models/user')

const async = require('async')

const { body, validationResult } = require('express-validator')

var bcrypt = require('bcryptjs')
const passport = require('passport')

// Check authentication
const checkAuthTrue = (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/')
    return
  }
}

const checkAuthFalse = (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }
}

// GET login
exports.user_login_get = function (req, res, next) {
  // Check authentication
  checkAuthTrue(req, res)

  res.render('login_form', {})
}

// POST login
exports.user_login_post = [
  body('email')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('email must be specified ')
    .isEmail()
    .withMessage('email must be valid email'),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('password must be specified')
    .isLength({ min: 6 })
    .withMessage('password must be over 6 char'),

  (req, res, next) => {
    // Check authentication
    checkAuthTrue(req, res)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log('errors first func')
      res.render('login_form', { errors: errors.array() })
      return
    } else {
      console.log('next worked')
      return next()
    }
  },
]

exports.user_login_auth_post = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
})

// GET register
exports.user_register_get = function (req, res, next) {
  // Check authentication
  checkAuthTrue(req, res)

  res.render('register_form', {})
}

// POST register
exports.user_register_post = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('username must be specified')
    .isLength({ min: 3 })
    .withMessage('username at least must be 3 character')
    .custom(async (username, { req }) => {
      const isUsername = await User.findOne({ username: username })

      if (isUsername) {
        throw new Error('username in use')
      }
    }),
  body('email')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('email must be specified ')
    .isEmail()
    .withMessage('email must be valid email')
    .custom(async (email, { req }) => {
      const isEmail = await User.findOne({ email: email })

      if (isEmail) {
        throw new Error('Email in use')
      }
    }),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('password must be specified')
    .isLength({ min: 6 })
    .withMessage('password must be over 6 char')
    .custom((password, { req }) => {
      console.log(req.body.rpassword, password, 'this')
      if (password !== req.body.rpassword) {
        return false
      } else {
        return true
      }
    })
    .withMessage('Passwords must match'),

  body('avatar').escape(),

  (req, res, next) => {
    // Check authentication
    checkAuthTrue(req, res)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors)
      res.render('register_form', { errors: errors.array() })
      return
    } else {
      bcrypt.hash(req.body.password, 5, function (err, hash) {
        if (err) {
          return next(err)
        }

        // create user with hashed password
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          avatar: req.body.avatar || 1,
        })

        newUser.save(function (err) {
          if (err) {
            return next(err)
          }

          // User registered, redirect
          res.redirect('/')
        })
      })
    }
  },
]

// POST user logout
exports.user_logout_post = function (req, res, next) {
  // Check authentication
  checkAuthFalse(req, res)

  req.logout()
  res.redirect('/')
}

// GET profile
exports.user_profile_get = function (req, res, next) {
  // Check authentication
  checkAuthFalse(req, res)

  res.render('profile', {})
}
