const express = require('express');

//Authentication 
const { checkAuthenticated } =  require('../engines/functions/function');

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('../database.js');

const { deleteBlogKey } = require('../engines/blog/blogImagesDelete');

//Get the UserID 
require('dotenv').config();
const userID = process.env.ID;

module.exports = app => {

    //*********DELETE REQUESTS*********//

      //Blog Delete Post
      app.delete('/blogDelete', checkAuthenticated, async (req, res) => {
      
        try {
      
          //Take the original post date as an identifier
          const uploadedAt = req.body.date 
    
          await new Promise ((resolve,reject) => {
            db.getConnection( async (err, connection) => {
              if (err) reject(err);

              deleteBlogKey(uploadedAt, null, true, () => {
                console.log('Blog Directory Deleted')
              });
            
              //Setup Blog Entry Deletion Query
              const blogDelete = 
              `DELETE FROM post WHERE uploadedAt = ? AND userID = ?;`

              const deleteQuery = mysql.format(blogDelete, [uploadedAt, userID])

              //Delete the Post
              connection.query (deleteQuery, (err, result) => {
                console.log('Post Entry Deleted')
                console.log(err)
                console.log(result)
                if (err) reject(err)
              })
            
              //Setup BlogImages Deletion Query
              const imagesDelete = 
              `DELETE FROM blogImages WHERE uploadedAt = ? AND userID = ?;`

              const imagesDeleteQuery = mysql.format(imagesDelete, [uploadedAt, userID])

              //Delete BlogImages Entries
              connection.query (imagesDeleteQuery, (err, result) => {
                connection.release()
                console.log('Deleted BlogImage Entries')
                console.log(err)
                console.log(result)
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