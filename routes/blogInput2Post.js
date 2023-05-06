//Express
const express = require('express');

//Base Functions
const functions = require('./function');

    //Authentication 
    const checkAuthenticated = functions.checkAuthenticated;

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const database = require('./database');
const db = database.db;

//FS for File Directory Pathing
const fs = require('fs');  

module.exports = app => {
  //Photo Editing Put Method
  app.post('/blogInput2', checkAuthenticated, async (req,res) => {
    try {

      console.log('POST Method BlogInput2');

      //Shared AboutMe and Blog Variables

      //True Content with Correct Image Locations 
      let trueContent = req.body.html;

      //Clean up the stylings of the html
      trueContent = trueContent.replace(/cursor: pointer;/g, '');

      //Unix Timestamp value, matches database
      const uploadedAt = req.body.date;    
      
      //Setup Delete Fileslength Variable
      let filesLength;

      // If we're doing aboutme and not a blog...
      if (req.body.aboutme) {

        //Connect to Mysql
        await new Promise ((resolve,reject) => {
          db.getConnection( async (err, connection) => {
            if (err) throw (err);

            const htmlInsert = 
            `UPDATE aboutme 
              SET 
                content = ?
              WHERE uploadedAt = ?;`;

            const htmlInsertQuery = mysql.format(htmlInsert, [trueContent, uploadedAt]);

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
                  req.body.fileName
                ]

                const imageDelete = `DELETE FROM blogImages
                WHERE uploadedAt = ? AND src = ? LIMIT 1`;
              
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
                    req.body.fileName[i]
                  ];

                  const imageDelete = `DELETE FROM blogImages
                  WHERE uploadedAt = ? AND src = ? LIMIT 1`;
                
                  const imageQuery = mysql.format(imageDelete, imageValues);

                  connection.query (imageQuery, (err, result) => {
                      connection.release()
                      if (err) throw (err);
                      console.log(result)
                      console.log('Image Entry Deleted');
                  });
                    
                };

              }

          

              if (typeof deletedFiles === 'string') {
                const rowSql = 'SELECT * FROM blogImages WHERE uploadedAt = ? AND src = ? LIMIT 1';
                const rowValues = [uploadedAt, deletedFiles];
                const query = mysql.format(rowSql, rowValues)
                connection.query(query, (err, rows) => {
                    connection.release();
                    if (err) throw err;

                    if (rows.length === 0) {
                      fs.unlink(`./public/images/blogImages/${uploadedAt}/${deletedFiles}`, err => {
                          if (err) {
                          console.error(err);
                          } else {
                          console.log(`File ${deletedFiles} deleted successfully`);
                          };
                      });
                    };
                });
              } else {
                deletedFiles.forEach(file => {
                  const rowSql = 'SELECT * FROM blogImages WHERE uploadedAt = ? AND src = ? LIMIT 1';
                  const rowValues = [uploadedAt, file];
                  const query = mysql.format(rowSql, rowValues)
                  connection.query(query, (err, rows) => {
                    connection.release();
                    if (err) throw err;

                    if (rows.length === 0) {
                        fs.unlink(`./public/images/blogImages/${uploadedAt}/${file}`, err => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log(`File ${file} deleted successfully`);
                        }
                        });
                    };
                  });
                });
              };
      
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
                  WHERE uploadedAt = ?;`;

                  values = [
                      content,
                      trueContent,
                      filesLength,
                      uploadedAt
                  ];

                  //Else, no fileAmount modifications are necessary
                  } else {

                  htmlInsert = `UPDATE post 
                  SET 
                      content = ?,
                      trueContent = ?
                  WHERE uploadedAt = ?;`;

                  values = [
                      content,
                      trueContent,
                      uploadedAt
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

