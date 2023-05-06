const express = require('express')

//Base Functions
const functions = require('./function.js')

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

    //*********DELETE REQUESTS*********//

      //Blog Delete Post
      app.delete('/blogDelete', checkAuthenticated, async (req, res) => {
      
        try {
      
          //Take the original post date as an identifier
          const uploadedAt = req.body.date 
    
          await new Promise ((resolve,reject) => {
            db.getConnection( async (err, connection) => {
              if (err) reject(err)

              //Removes the Directory, which is named after the original UNIX value
              fs.rmSync(`./public/images/blogImages/${uploadedAt}`, { recursive: true, force: true })
            
              //Setup Blog Entry Deletion Query
              const blogDelete = 
              `DELETE FROM post WHERE uploadedAt = ?;
              ALTER TABLE post AUTO_INCREMENT = 1;`

              const deleteQuery = mysql.format(blogDelete, uploadedAt)

              //Delete the Post
              connection.query (deleteQuery, (err, result) => {
                console.log('Post Entry Deleted')
                if (err) reject(err)
              })
            
              //Setup BlogImages Deletion Query
              const imagesDelete = 
              `DELETE FROM blogImages WHERE uploadedAt = ?;
              ALTER TABLE blogImages AUTO_INCREMENT = 1;`

              const imagesDeleteQuery = mysql.format(imagesDelete, uploadedAt)

              //Delete BlogImages Entries
              connection.query (imagesDeleteQuery, (err, result) => {
                connection.release()
                console.log('Deleted BlogImage Entries')
                if (err) reject(err)

                return resolve(result)
              })

          })

        })  
          
          //Redirects to list of blogs for editing, not the public list
          res.redirect('/blogEditList')

        } catch {

          res.redirect('/blogInput')
          console.log('ERROR')

        }

      })

}