//Express
const express = require('express')

//uuid for unique token generation
const crypto = require('crypto')

//Base Functions
const functions = require('./function')

    //Authentication 
    const checkAuthenticated = functions.checkAuthenticated

//Mysql Functionality
const mysql = require('mysql2')

//Database Configuration
const database = require('./database')
const db = database.db

//FS for File Directory Pathing
const fs = require('fs')  

module.exports = app => {

//*********BLOG FEATURE PUT*********//

      //Update post to either feature or unfeature blog 
    app.put('/blogFeature', checkAuthenticated, async (req, res) => {
        try { 

          const date = req.body.date;

          await new Promise((resolve, reject) => {
            db.getConnection( async (err, connection) => {
              if (err) reject(err);

              const featureQuery = `UPDATE post SET featured = CASE 
                                      WHEN featured = 0 THEN 1 
                                      ELSE 0 
                                    END
                                    WHERE uploadedAt = ?`;

              const featureUpdate = mysql.format(featureQuery, [date]);

              connection.query(featureUpdate, (err, result) => {
                connection.release();
                if (err) reject(err);
                return resolve(result);
              })

            })
          })

          res.redirect('/blogEditList')

        } catch {

          res.redirect('/blogEditList')
          console.log("ERROR")

        }
    })
}