const User = require('../models/user')
const Message = require('../models/message')

const async = require('async')

const { body, validationResult } = require('express-validator')

// GET login
exports.user_login_get = function (req, res, next) {
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
    .isLength({ min: 1 })
    .escape()
    .withMessage('password must be specified')
    .isLength({ min: 6 })
    .withMessage('password must be over 6 char'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('login_form', { errors: errors.array() })
      return
    } else {
      User.findOne({ email: req.body.email }).exec(function (err, user) {
        if (err) {
          return next(err)
        }

        // Passwords don't match
        if (req.body.password !== user.password) {
          res.redirect('/login')
          return
        }

        // User signed in
        res.redirect('/')
        /* res.redirect(newUser.url) */
      })
    }
  },
]

// GET register
exports.user_register_get = function (req, res, next) {
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
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors)
      res.render('register_form', { errors: errors.array() })
      return
    } else {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        avatar: req.body.avatar || 1,
      })

      newUser.save(function (err) {
        if (err) {
          return next(err)
        }

        // User registered, redirect
        res.redirect('/')
      })
    }
  },
]
