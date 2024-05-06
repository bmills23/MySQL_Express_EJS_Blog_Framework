// Move out to routes base folder to use again

const express = require('express');

const bcrypt = require('bcrypt');

const mysql = require('mysql2');

const { db } = require('./database');

module.exports = app => {
  //Optional Registration Form
  app.post('/register', async (req, res) => { //bcrypt is async library
    
    try {

      console.log(req.body);
        
      const fName = req.body.firstName;
      const lName = req.body.lastName;
      const email = req.body.email;
      const website = req.body.website;

      const password = await bcrypt.hash(req.body.password, 10);
  
      db.getConnection( async (err, connection) => {
  
        if (err) throw (err)
  
        const sqlSearch = "SELECT * FROM user WHERE fName = ?";
        const searchQuery = mysql.format(sqlSearch, [fName]);
        const sqlInsert = "INSERT INTO user (fName, lName, email, password, website) VALUES (?,?,?,?,?)";
        const insertQuery = mysql.format(sqlInsert,[fName, lName, email, password, website]);
  
        connection.query (searchQuery, async (err, result) => {
        if (err) throw (err);
        console.log("------> Search Results");
        console.log(result.length);
        if (result.length != 0) {
          connection.release();
          console.log("------> User already exists");
        } 
  
        else {
            connection.query (insertQuery, (err, result)=> {
            connection.release();
            if (err) throw (err);
            console.log ("--------> Created new User");
            console.log(result.insertId);
          })
        }
    
          }) //end of connection.query()

        }) //end of db.getConnection()

      res.redirect('/login');

    } catch {

      res.redirect('/register');

    }
  })

}