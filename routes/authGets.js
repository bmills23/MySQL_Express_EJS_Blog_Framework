//Express
const express = require('express')

module.exports = app => {

   //Login
    app.get('/login', (req, res) => {
        res.render('login', 
        {  
            //Header
            originalUrl : req.originalUrl,
            isAuthenticated : req.isAuthenticated()

        })
    })

    //Register 
    app.get('/register', (req, res) => {
        res.render('register', 
        { 
            //Header
            originalUrl : req.originalUrl,
            isAuthenticated : req.isAuthenticated(), 
            
        })
    })
    
}