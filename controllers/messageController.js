const User = require('../models/user')
const Message = require('../models/message')

const async = require('async')
const { body, validationResult } = require('express-validator')

require('dotenv').config()

// Check authentication
const checkIfNotAuth = (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/')
    return
  }
}

const checkIfAuth = (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/')
    return
  }
}

// POST message
exports.message_new_post = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('title must be specified')
    .isLength({ max: 20 })
    .withMessage('title must be under 20 characters'),

  body('text')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('title must be specified')
    .isLength({ max: 500 })
    .withMessage('title must be under 500 characters'),

  (req, res, next) => {
    // Check authentication
    checkIfAuth(req, res)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.render('profile', { errorsPost: errors.array() })
      return
    } else {
      const newMessage = new Message({
        title: req.body.title,
        text: req.body.text,
        user: req.user._id,
      })

      newMessage.save(function (err) {
        if (err) {
          return next(err)
        }

        // Message sent
        res.redirect('/')
      })
    }
  },
]
