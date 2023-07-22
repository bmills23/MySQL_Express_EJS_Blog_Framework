//Express
const express = require('express');

//uuid for unique token generation
const crypto = require('crypto');

//Authentication 
const { checkAuthenticated } = require('../engines/functions/function');

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('../database');

//Uploading Engine
const { upload } = require('../engines/blog/blogImages');

//S3 BlogPhoto Deletion Function
const { deleteFiles } = require('../engines/functions/blogImageDelete');

//Get the UserID dynamically 
require('dotenv').config();
const userID = process.env.ID;

module.exports = app => {

  //Blog Update Post/Update old posts (blogEdit.ejs)
  app.post('/blogUpdate', 
  upload.fields([
    { 
      name: 'blogImages'
    }
  ]),
  //Have to put this after upload.fields... req.body needs time to populate
  checkAuthenticated, async (req, res) => {
    try {

        console.log('POST Method blogUpdate');

        /*Generate a token to pass to next blogInput page;
        this will ensure that client cannot return to the previous page at any point;
        throws an error as defined in blogInput.get*/
        const token = crypto.randomBytes(16).toString('hex');
        req.session.token = token;
        res.cookie('token', token, { httpOnly : true });
  
        //Blog Input 
        const newContent = req.body.blogInput;
        const trueContent = req.body.trueContent;
        const newTitle = req.body.title;
    
        //Same Functionality as the blogInput
        //Splits Content into Different Paragraphs in an array based on line breaks
        const paragraphs = newContent.split('\n');

        //Regex wraps each paragraph in paragraph tags, allowing for image prepend/append
        const templates = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);

        //Rejoin templates into single string of HTML content 
        let content = templates.join('');

        //New Unix Value
        const newDate = req.body.newDate;
    
        //Old Date, Unchanged and Used as identifier
        const uploadedAt = req.body.date;
        
        //FileAmount is 0 by default in case no new photos are added
        let fileAmount = 0;

        //Fileslength will be Derived From deletedFiles
        const deletedFiles = req.body.fileName;

        //Update File Field
        if (Object.keys(req.files).length !== 0) {
          fileAmount = req.files.blogImages.length;
        }

        //Promise to Communicate with Database
        await new Promise ((resolve,reject) => {
          db.getConnection( async (err, connection) => {

          if (err) reject(err)

          //Begin Image Insertion Formatting
          //Array of Objects Defining Uploaded Images
          const blogImages = req.files.blogImages;
          
          if (blogImages) {
            for (let i = 0; i < blogImages.length; i++) {
              //x = 0, y = 0, src = originalname, uploadedAt = unix date
              //x and y will be defined during the image editing phase 
              const imageSql = `INSERT INTO blogImages
              (x, y, src, uploadedAt, userID)
              VALUES (?, ?, ?, ?, ?)`

              const imageValues = [
                0,
                0,
                blogImages[i].originalname,
                uploadedAt,
                userID
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
          }

          //Check for File Deletions First, else skip to blog update
          if (req.body.fileName) {

            //Setup array to delete image entries
            let imageValues = [];

            if (typeof deletedFiles === 'string') {
              
              imageValues = [
                uploadedAt,
                req.body.fileName,
                userID
              ]

              const imageDelete = `DELETE FROM blogImages
              WHERE uploadedAt = ? AND src = ? AND userID = ? LIMIT 1`;
            
              const imageQuery = mysql.format(imageDelete, imageValues);

              connection.query (imageQuery, (err, result) => {
                  connection.release()
                  if (err) throw (err);
                  console.log(result)
                  console.log('Image Entry Deleted');
              });

            } else {

              filesLength = req.body.fileName.length;

              //Delete Entries for Deleted Images in Database First
              for (let i = 0; i < filesLength; i++) {
              
                imageValues =[
                  uploadedAt,
                  req.body.fileName[i],
                  userID
                ];

                const imageDelete = `DELETE FROM blogImages
                WHERE uploadedAt = ? AND src = ? AND userID = ? LIMIT 1`;
              
                const imageQuery = mysql.format(imageDelete, imageValues);

                connection.query (imageQuery, (err, result) => {
                    connection.release()
                    if (err) throw (err);
                    console.log(result);
                    console.log('Image Entry Deleted');
                });
                  
              };

            }

             //Function imported from functions/blogImageDelete
             await deleteFiles(connection, uploadedAt, deletedFiles);
    
          };
          
          //Begin Functionality for Deleting Entries and Files for Deleted Images
          if (req.body.fileName) {

            //Setup Content Update
            //Use var to circumnavigate block scope
            var update
            var blogValues = []

            if (typeof deletedFiles === 'string') {
              filesLength = 1
            } else {
              filesLength = req.body.fileName.length
            }

            update =  `UPDATE post 
            SET 
              content = ?,
              trueContent = ?,
              updatedDate = ?,
              title = ?,
              fileAmount = fileAmount + ? - ?
            WHERE uploadedAt = ? AND userID = ?;` 

            blogValues = [
              content,
              trueContent,
              newDate,
              newTitle,
              fileAmount, filesLength,
              uploadedAt,
              userID
            ]

          //Else for no req.body.fileName
          //Else No Files have been deleted
          } else {

            update =  `UPDATE post 
            SET 
              content = ?,
              trueContent = ?,
              updatedDate = ?,
              title = ?,
              fileAmount = fileAmount + ?
            WHERE uploadedAt = ? AND userID = ?;` 

            blogValues = [
              content,
              trueContent,
              newDate,
              newTitle,
              fileAmount,
              uploadedAt,
              userID
            ]
          }       

          //Query Formatting for Blog Update
          const updateQuery = mysql.format(update, blogValues);

          //Update Content
          connection.query (updateQuery, (err, result) => {
            console.log('Blog Updated')
            console.log(err)
            if (err) reject(err)
            return resolve(result)
          })

        })
    
      }) 
    
      //Redirects to Photo Editing Phase if no new photos
      if (req.body.oldEdits === '0') {

        res.redirect('/blogEdit2?' + '&uploadedAt=' + uploadedAt + '&fileAmount=' + fileAmount)

      //Else Redirects to Public Blog List
      } else {

        res.redirect('/blogs')

      }
      
    } catch {
    
      res.redirect('/blogInput')
      console.log('ERROR')
  
    }

  })

}

 