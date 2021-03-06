'use strict';

const { Router } = require('express')
const bcrypt = require('bcrypt')

const router = Router()

const User = require('../models/user.js')

router.get('/', (req, res) => {
  console.log('USER:', req.body)
  res.render('index')
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', ({ session, body: { email, password }}, res, err) => {
  User.findOne({ email })
    .then(user => {
      if (user) {
        return new Promise((resolve, reject) => {
          bcrypt.compare(password, user.password, (err, matches) => {
            if (err) {
              reject(err)
            } else {
              resolve(matches)
            }
          })
        })
      } else {
        res.render('login', { msg: 'Account does not exist'})
      }
    })
    .then(matches => {
      if (matches) {
        session.email = email
        res.redirect('/')
      } else {
        res.render('login', { msg: 'Password does not match'})
      }
    })
    .catch(err)
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', ({ session, body: { email, password }}, res, err) => {
  console.log(session)
  User.findOne({ email })
    .then(user => {
      if (user) {
        res.render('register', { msg: 'User already exists'})
      } else {
        return new Promise((resolve, reject) => {
          bcrypt.hash(password, 13, (err, hash) => {
            if (err) {
              reject(err)
            } else {
              resolve(hash)
            }
          })
        })
      }
    })
    .then(hash => User.create({ email, password: hash }))
    .then(() => res.redirect('login'))
    .catch(err)
})

// router.get('/logout', (req, res) => {
//
// })

// guard middleware
router.use((req, res, next) => {
  if (req.user) {
    next()
  } else {
    res.redirect('login')
  }
})

module.exports = router
