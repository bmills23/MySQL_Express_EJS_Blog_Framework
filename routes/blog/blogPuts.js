//Express
const express = require('express');

//Authentication 
const { checkAuthenticated } = require('../engines/functions/function');

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('../database');

//Get the UserID dynamically 
require('dotenv').config();
const userID = process.env.ID;

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
                                    WHERE uploadedAt = ? AND userID = ?`;

              const featureUpdate = mysql.format(featureQuery, [date, userID]);

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