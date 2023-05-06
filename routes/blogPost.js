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

//Multer for Disk Storage Pathing
const multer  = require('multer')

    //Uploading Engine
    const uploading = require('./engines/blogImages')

    const upload = uploading.upload

//FS for File Directory Pathing
const fs = require('fs')  

module.exports = app => {

    //*********BLOG INPUT POST*********//
      
      //Initial Blog Input Post/new blog creation (blog.ejs)
      //Also handles first step of Input on old blogs
      app.post('/blogInput', 
      //Don't need to call delete middleware yet since this is the first posting instance
       upload.fields([
        { 
          name: 'blogImages'
        }
      ]),
       checkAuthenticated, 
       async (req, res) => {
        try {

          console.log('POST Method blogInput')       
         
          /*Generate a token to pass to next blogInput page;
          this will ensure that client cannot return to the previous page at any point;
          throws an error as defined in blogInput.get*/
          const token = crypto.randomBytes(16).toString('hex')
          req.session.token = token
          res.cookie('token', token, { httpOnly : true })

          //Capture blog content and title input
          const content = req.body.blogInput
          const title = req.body.title

          //Splits Content into Different Paragraphs in an array based on line breaks
          const paragraphs = content.split('\n');

          //wraps each paragraph in paragraph tags, allowing for image prepend/append
          const templates = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);

          //Rejoin templates into single string of HTML content 
          const template = templates.join('');
      
          //Unix Time Stamp value; if never edited, update will always be date
          const uploadedAt = req.body.date
          const update = req.body.date
          
          //Amount of Files Uploaded by User
          const fileAmount = req.files.blogImages.length 

          //This is the first round of uploading, so we will pass newBlog to req.params
          const newBlog = true   
          
          //Promise for Database Communication
          await new Promise ((resolve,reject) => {
            db.getConnection( async (err, connection) => {
            if (err) throw (err)

            //Begin blog text insertion formatting

            /* 
            *FOR INSERTION INTO DB POST
            Data Types of Each Column
              -ID : Auto-Incrementing MEDIUMINT (not inserted)
              - Content : LONGTEXT 
              - date : BIGINT
              - updatedDate : BIGINT
              - title : TEXT
              - fileAmount : TINYINT 
              - featured : TINYINT(1) - stand-in for BOOL
            */

            //Inserts req values defined above and sets featured to false
            const blogSql = `INSERT INTO post 
              (content, trueContent, uploadedAt, updatedDate, title, fileAmount, featured) 
              VALUES (?,?,?,?,?,?,?)`

            const values = [
              template,
              '',
              uploadedAt,
              update,
              title,
              fileAmount,
              0
            ]

            const insertQuery = mysql.format(blogSql, values)

            /* 
            *FOR INSERTION INTO DB blogImages
            Data Types of Each Column
              - ID : Auto-Incrementing MEDIUMINT (not inserted)
              - x : INT 
              - Y : INT
              - src : VARCHAR(1000)
              - uploadedAt : BIGINT
            */

            //Begin Image Insertion Formatting
            //Array of Objects Defining Uploaded Images
            const blogImages = req.files.blogImages
  
            for (let i = 0; i < blogImages.length; i++) {
              //x = 0, y = 0, src = originalname, uploadedAt = unix date
              //x and y will be defined during the image editing phase 
              const imageSql = `INSERT INTO blogImages
              (x, y, src, uploadedAt)
              VALUES (?, ?, ?, ?)`

              const imageValues = [
                0,
                0,
                blogImages[i].originalname,
                uploadedAt
              ]

              const imagesInsert = mysql.format(imageSql, imageValues)

              connection.query( imagesInsert, (err, result) => {
                if (err) throw (err)
                else {
                  connection.release()
                  console.log(`${blogImages[i].originalname} Information Inserted`)
                }
              })
            }
          
            connection.query (insertQuery, (err, result) => {

              connection.release()
              if (err) reject(err)
              return resolve(result)
              })
            })
          })
          
          //Redirects to Photo Editing Phase with Unique Token
          //New blog = true
          //uploadedAt and fileAmount also passed into req.query
          //We're also going to add newFiles for consistency 
          res.redirect('/blogEdit2?newBlog=' + newBlog + '&uploadedAt=' + uploadedAt + '&newFiles=' + fileAmount)
      
        } catch {

        res.redirect('/blogInput')
        console.log('ERROR')

        } 

    })
     
}

  
  