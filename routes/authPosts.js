const express = require('express')


//Mysql Functionality
const mysql = require('mysql2')

//Database Config
const database = require('./database.js')
const db = database.db

//Passport and Bcrypt for Login
const passport = require('passport')

const bcrypt = require('bcrypt')

module.exports = app => {
   
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

  // LOGOUT
  app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err) }
      res.redirect('/login')
    })
  })

}