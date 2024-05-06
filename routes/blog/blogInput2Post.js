//Express
const express = require('express');

//Authentication 
const { checkAuthenticated } = require('../engines/functions/function');

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('../database');

const { deleteFiles } = require('../engines/functions/blogImageDelete');
const { deleteImages } = require('../engines/functions/aboutMeImageDelete');

//Get the UserID dynamically 
require('dotenv').config();
const userID = process.env.ID;

module.exports = app => {
  //Photo Editing Put Method
  app.post('/blogInput2', checkAuthenticated, async (req,res) => {
    try {

      console.log('POST Method BlogInput2');

      console.log(req.body);

      //Shared AboutMe and Blog Variables

      //True Content with Correct Image Locations 
      let trueContent = req.body.html;

      //Clean up the stylings of the html
      trueContent = trueContent.replace(/cursor: pointer;/g, '');

      //Unix Timestamp value, matches database
      const uploadedAt = req.body.date;    
    
      // If we're doing aboutme and not a blog...
      if (req.body.aboutme) {

        //Banner Content
        const bannerContent = req.body.bannerContent;

        // Setup Variables for Deleted Files
        // Deleted Banner Files
        let deletedBannerImagesAmount = 0;
        const deletedBannerImages = req.body.fileNameBanner;

        console.log(deletedBannerImages)

        if (deletedBannerImages) {
          if (typeof deletedBannerImages === "string") {
            deletedBannerImagesAmount = 1
          } else {
            deletedBannerImagesAmount = deletedBannerImages.length;
          }
        }

        // Deleted About Me Files
        let deletedAboutMeImagesAmount = 0;
        const deletedAboutMeImages = req.body.fileName;

        console.log(deletedAboutMeImages)

        if (deletedAboutMeImages) {
          if (typeof deletedAboutMeImages === "string") {
            deletedAboutMeImagesAmount = 1
          } else {
            deletedAboutMeImagesAmount = deletedAboutMeImages.length;
          }
        }

        //Connect to Mysql
        await new Promise ((resolve,reject) => {
          db.getConnection( async (err, connection) => {
            if (err) throw (err);

            //Check for File Deletions First, else skip to blog update
            if (deletedAboutMeImages) {

              //Setup array to delete image entries
              let imageValues;

              if (typeof deletedAboutMeImages === 'string') {

                console.log("Single About Me Images Detected for Deletion");
                 
                imageValues = [req.body.fileName, userID];    
                console.log(imageValues);

                const imageDelete = `DELETE FROM aboutMeImages 
                WHERE imageType = 'aboutMeImage' AND src = ? AND userID = ? LIMIT 1`;
              
                const imageQuery = mysql.format(imageDelete, imageValues);

                connection.query (imageQuery, (err, result) => {
                    connection.release()
                    if (err) throw (err);
                    console.log(result)
                    console.log('Image Entry Deleted');
                });

              } else {

                //Delete Entries for Deleted Images in Database First
                for (let i = 0; i < deletedAboutMeImagesAmount; i++) {

                  console.log("Multiple About Me Images Detected for Deletion");
                
                  imageValues = [req.body.fileName[i], userID];
                  console.log(imageValues);

                  const imageDelete = `DELETE FROM aboutMeImages
                  WHERE imageType = 'aboutMeImage' AND src = ? AND userID = ? LIMIT 1`;
                
                  const imageQuery = mysql.format(imageDelete, imageValues);

                  connection.query (imageQuery, (err, result) => {
                      connection.release()
                      if (err) throw (err);
                      console.log(result)
                      console.log('Image Entry Deleted');
                  });
                    
                };

              }

              //Function imported from functions/blogImageDelete
              await deleteImages('aboutMeImage', 'aboutme', connection, deletedAboutMeImages)
      
            } 
            
            if (deletedBannerImages) {

              //Setup array to delete image entries
              let imageValues = [];

              if (typeof deletedBannerImages === 'string') {
                
                imageValues = [req.body.fileNameBanner, userID];

                const imageDelete = `DELETE FROM aboutMeImages 
                WHERE imageType = 'bannerImage' AND src = ? AND userID = ? LIMIT 1`;
              
                const imageQuery = mysql.format(imageDelete, imageValues);

                connection.query (imageQuery, (err, result) => {
                    connection.release()
                    if (err) throw (err);
                    console.log(result)
                    console.log('Image Entry Deleted');
                });

              } else {

                //Delete Entries for Deleted Images in Database First
                for (let i = 0; i < deletedBannerImagesAmount; i++) {
                
                  imageValues = [req.body.fileNameBanner[i], userID];

                  const imageDelete = `DELETE FROM aboutMeImages
                  WHERE imageType = 'bannerImage' AND src = ? AND userID = ? LIMIT 1`;
                
                  const imageQuery = mysql.format(imageDelete, imageValues);

                  connection.query (imageQuery, (err, result) => {
                      connection.release()
                      if (err) throw (err);
                      console.log(result)
                      console.log('Image Entry Deleted');
                  });
                    
                };

              }

              //Function imported from functions/blogImageDelete
              await deleteImages('bannerImage', 'banner', connection, deletedBannerImages)
          
            }

            const htmlInsert = 
            `UPDATE aboutme 
              SET 
                content = ?,
                bannerContent = ?,
                fileAmount = fileAmount - ?,
                aboutMeFiles = aboutMeFiles - ?
              WHERE uploadedAt = ? AND userID = ?;`;
           
            const values = [
              trueContent,
              bannerContent, 
              deletedBannerImagesAmount,
              deletedAboutMeImagesAmount,
              uploadedAt,
              userID
            ] 
  
            const htmlInsertQuery = mysql.format(htmlInsert, values);

            connection.query (htmlInsertQuery, (err, result) => {
              connection.release();
              if (err) reject(err);
              return resolve(result);
            });

          });

        });

        //Redirects to Index Page
        res.redirect('/');

      //Else we're working on a blog post...
      } else {

        //Content without Images
        const content = req.body.content;

        //Fileslength will be Derived From deletedFiles
        const deletedFiles = req.body.fileName;

        //Promise for Blog Database Communication
        await new Promise ((resolve,reject) => {

          //Connect to Mysql
          db.getConnection( async (err, connection) => {
            if (err) throw (err);

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

                filesLength = req.body.fileName.length

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
                      console.log(result)
                      console.log('Image Entry Deleted');
                  });
                    
                };

              }

              //Function imported from functions/blogImageDelete
              await deleteFiles(connection, uploadedAt, deletedFiles)
      
            };

                // * Setup insert of Blog Content into Post DB
                let htmlInsert = ``;
                let values = [];

                //If fileName, deletions occurred in the frontend 
                if (req.body.fileName) {
            
                  if (typeof deletedFiles === 'string') {
                    filesLength = 1;
                  } else {
                    filesLength = req.body.fileName.length
                  }

                  htmlInsert = `UPDATE post 
                  SET 
                      content = ?,
                      trueContent = ?, 
                      fileAmount = fileAmount - ?
                  WHERE uploadedAt = ? AND userID = ?;`;

                  values = [
                      content,
                      trueContent,
                      filesLength,
                      uploadedAt,
                      userID
                  ];

                  //Else, no fileAmount modifications are necessary
                  } else {

                  htmlInsert = `UPDATE post 
                  SET 
                      content = ?,
                      trueContent = ?
                  WHERE uploadedAt = ? AND userID = ?;`;

                  values = [
                      content,
                      trueContent,
                      uploadedAt,
                      userID
                  ];

                };

            //Format Insertions to Post DB
            const htmlInsertQuery = mysql.format(htmlInsert, values);

            //HTML Insert
            connection.query (htmlInsertQuery, (err, result) => {
              connection.release();
              console.log(err);
              console.log('Blog Content Inserted');
              if (err) reject(err);
              return resolve(result)
            });

          });

        });

        //Redirects to non-public blog list
        res.redirect('/blogEditList');
        
      };  

    } catch {

      res.redirect('/blogEdit2');
      console.log('ERROR');

    };

  });


};
