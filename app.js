var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

const mongoose = require('mongoose')
require('dotenv').config()
const MongoStore = require('connect-mongo')
const session = require('express-session')

const passport = require('passport')
var bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy

const User = require('./models/user')

var app = express()

/* mongoDB */

const mongoDb = process.env.DB_URI

mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'mongo connection error'))
mongoose.connection.readyState === 2 ? console.log('MongoDB connected') : ''

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// public folder
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

/* Session*/

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI,
      collection: 'sessions',
    }),
    cookie: { maxAge: 1000 * 60 * 60 },
    sameSite: 'strict',
  })
)

app.use(passport.initialize())
app.use(passport.session())

/* Passport */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },

    (email, password, done) => {
      console.log('passport')
      User.findOne({ email: email }, (err, user) => {
        console.log('passport 2')
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, { message: 'Incorrect username' })
        }

        bcrypt.compare(password, user.password, (err, res) => {
          console.log('passport 3')
          if (res) {
            return done(null, user)
          } else {
            return done(null, false, { message: 'Incorrect password' })
          }
        })
      })
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

app.use(function (req, res, next) {
  res.locals.currentUser = req.user
  next()
})

/* Routes */
app.use('/', indexRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
