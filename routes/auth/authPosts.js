const express = require('express');

//Passport and Bcrypt for Login
const passport = require('passport');

module.exports = app => {
   
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }))

  // LOGOUT
  app.delete('/logout', function(req, res) {
    req.session = null; // Clear the session data by setting it to null
    res.redirect('/'); // Redirect the user to the login page or any other desired destination
  });

}