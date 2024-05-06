//Express
const express = require('express');

//uuid for unique token generation
const crypto = require('crypto');

//Unix Time Conversion
const { checkAuthenticated, timeConverter } = require('./engines/functions/function')

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('./database.js');

//Console.Log Early Warning, Will Fire with Index Get
db.getConnection( (err, connection) => {
    console.log(err)
    if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)
})

//File Engine 
const { upload }  = require('./engines/aboutme/aboutMeImages');
const { deleteImages } = require('./engines/functions/aboutMeImageDelete');

//Get the UserID 
require('dotenv').config();
const userID = process.env.ID;

module.exports = app => {
    
    //*********GET REQUESTS*********//

    //Index 
    app.get('/', (req, res) => {
        db.getConnection( async (err, connection) => {
            if (err) throw (err);

            //Query About Me Table
            const sqlQuery = "SELECT * FROM aboutme WHERE userID = ?;";
            const sqlSearch = mysql.format(sqlQuery, userID);

            //Query About Me Images Table
            const bannerImageQuery = "SELECT * FROM aboutMeImages WHERE imageType = 'bannerImage' AND userID = ?;";
            const bannerImageSearch = mysql.format(bannerImageQuery, userID);

            const aboutMeImageQuery = "SELECT * FROM aboutMeImages WHERE imageType = 'aboutMeImage' AND userID = ?;";
            const aboutMeImageSearch = mysql.format(aboutMeImageQuery, userID);

            //Query Blog Posts
            const blogQuery = "SELECT * FROM post WHERE userID = ?;";
            const blogSearch = mysql.format(blogQuery, userID);

            //Query blogImages 
            const imageQuery = "SELECT * FROM blogImages WHERE userID = ?;";
            const imageSearch = mysql.format(imageQuery, userID);

            connection.query (sqlSearch, (err, result) => {
              if (err) throw (err);

              const aboutMe = result;

              connection.query (bannerImageSearch, (err, result) => {
                if (err) throw (err);

                const bannerImages = result;

                connection.query (aboutMeImageSearch, (err, result) => {
                  if (err) throw (err);
  
                  const aboutMeImages = result;
  
                  connection.query (blogSearch, (err, result) => {
                    if (err) throw (err);
    
                    const blogs = result;
    
                    connection.query (imageSearch, (err, result) => {
                      connection.release();
                      if (err) throw (err);
    
                      const images = result;
    
                      res.render('index', 
    
                        {

                          aboutMe, 
                          bannerImages,
                          aboutMeImages,
                          blogs, 
                          images,
    
                          //Header
                          originalUrl : req.originalUrl,
                          isAuthenticated : req.isAuthenticated(),
                          
                          timeConverter
    
                        });  
    
                    }); // End blogimage search query 
    
                  }); // End blog search query 
  
                }); // End aboutme content image query 

              }); // End bannerimage query 

            }); // End aboutme data query 

        });

    });

    //Eyes Only Edit Index Page
    app.get('/editAboutMe', checkAuthenticated, (req, res) => {
        db.getConnection( async (err, connection) => {
          if (err) throw (err)
          const sqlSearch = "SELECT * FROM aboutme WHERE userID = ?;"
          const aboutMeResult = mysql.format(sqlSearch, userID);
       
          connection.query (aboutMeResult, (err, result) => {
            connection.release();
            if (err) throw (err);
      
            const aboutMe = result;
       
            res.render('editAboutMe', 
            { 
              aboutMe, 
                            
              //Header
              originalUrl : req.originalUrl,
              isAuthenticated : req.isAuthenticated(),

              timeConverter } )
          })
        })
      })


    //*********PUT REQUESTS*********//

    //Update About Me, Put Only Because the DB is seeded; see extraneousfunctions.js
    app.put('/aboutMeUpdate', 
    //Then call the function to upload new files
    upload.fields([
      {
        name: 'bannerImage'
      },
      {
        name: 'aboutMeImage'
      }
    ]), 
    checkAuthenticated, 
    async (req, res) => {
        try {

        console.log('PUT Method AboutMeUpdate');

        console.log(req.body);

        /*Generate a token to pass to next blogInput2 page;
        this will ensure that client cannot return to the previous page at any point;
        throws an error as defined in get*/
        const token = crypto.randomBytes(16).toString('hex');
        req.session.token = token;
        res.cookie('token', token, { httpOnly : true });

        //Setup Variables for Varying Scenarios

        //fileAmount is for bannerImages
        let fileAmount = 0;
        const bannerImages = req.files.bannerImage;
        console.log(bannerImages);
        
        //aboutMeFiles is for photos in the body of the about me
        let aboutMeFiles = 0;
        const aboutMeImages = req.files.aboutMeImage;
        console.log(aboutMeImages);

        /*If any photos whatsoever are uploaded, this will trigger
          a redirect to the blogEdit2 page for aboutme
        */

        let indexPhotos = false;

        if (aboutMeImages || bannerImages) {
          indexPhotos = true;
        }

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

        //About Me Content 
        let content = req.body.aboutMeUpdate;

        //Clean it up
        content.replace(/cursor: pointer;/g, '');

        /* 
          Need to clean up any accessory html tags, negates the use of stylings as well
          removes all html tags that aren't <div>, </div>, or <br>
        */
        
        content.replace(/<(?!\/?(div|br)\b)[^>]*>/gi, '');

        //Updated Date
        const newDate = req.body.newDate;

        //Previous File Amounts for Next Editing Page, if applicable
        const aboutMeFileField = req.body.aboutMeFileField;

        //BannerContent
        const bannerContent = req.body.bannerContent;

        //AboutMeColor
        const color = req.body.aboutMeColor;

        //User's Theme => goes to User Table
        const userTheme = req.body.trueColor;

        await new Promise ((resolve,reject) => {

            db.getConnection( async (err, connection) => {
            if (err) reject(err)

            if (bannerImages) {

              fileAmount = bannerImages.length;

              for (let i = 0; i < fileAmount; i++) {
                //x = 0, y = 0, src = originalname, uploadedAt = unix date
                //x and y will be defined during the image editing phase 
                const imageSql = `INSERT INTO aboutMeImages
                (x, y, src, uploadedAt, imageType, userID)
                VALUES (?, ?, ?, ?, ?, ?)`;
  
                const imageValues = [
                  0,
                  0,
                  bannerImages[i].originalname,
                  newDate,
                  'bannerImage',
                  userID
                ];
  
                const imagesInsert = mysql.format(imageSql, imageValues);
  
                connection.query( imagesInsert, (err, result) => {
                  if (err) reject(err)
                  else {
                    connection.release();
                    console.log(`${bannerImages[i].originalname} Information Inserted`);
                  }
                })
              }
            }

            if (aboutMeImages) {

              aboutMeFiles = aboutMeImages.length;

              for (let i = 0; i < aboutMeFiles; i++) {
                //x = 0, y = 0, src = originalname, uploadedAt = unix date
                const imageSql = `INSERT INTO aboutMeImages
                (x, y, src, uploadedAt, imageType, userID)
                VALUES (?, ?, ?, ?, ?, ?)`
  
                const imageValues = [
                  0,
                  0,
                  aboutMeImages[i].originalname,
                  newDate,
                  'aboutMeImage',
                  userID 
                ];
  
                const imagesInsert = mysql.format(imageSql, imageValues);
  
                connection.query( imagesInsert, (err, result) => {
                  if (err) reject(err)
                  else {
                    connection.release()
                    console.log(`${aboutMeImages[i].originalname} Information Inserted`)
                  }
                })
              }
              
            }

          //Check for File Deletions First, else skip to blog update
          if (deletedAboutMeImages) {

            //Setup array to delete image entries
            let imageValues;

            if (typeof deletedAboutMeImages === 'string') {
              
              imageValues = [req.body.fileName, userID];  
              console.log(imageValues);  

              const imageDelete = `DELETE FROM aboutMeImages 
              WHERE imageType = 'aboutMeImage' AND src = ? AND userID = ? LIMIT 1`;
            
              const imageQuery = mysql.format(imageDelete, imageValues);

              connection.query (imageQuery, (err, result) => {
                  connection.release()
                  if (err) reject(err);
                  console.log(result)
                  console.log('Image Entry Deleted');
              });

            } else {

              filesLength = deletedAboutMeImages.length
              console.log(filesLength);

              //Delete Entries for Deleted Images in Database First
              for (let i = 0; i < filesLength; i++) {
              
                imageValues = [req.body.fileName[i], userID];

                const imageDelete = `DELETE FROM aboutMeImages
                WHERE imageType = 'aboutMeImage' AND src = ? AND userID = ? LIMIT 1`;
              
                const imageQuery = mysql.format(imageDelete, imageValues);

                connection.query (imageQuery, (err, result) => {
                    connection.release()
                    if (err) reject(err);
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
              console.log(imageValues)

              const imageDelete = `DELETE FROM aboutMeImages 
              WHERE imageType = 'bannerImage' AND src = ? AND userID = ? LIMIT 1`;
            
              const imageQuery = mysql.format(imageDelete, imageValues);

              connection.query (imageQuery, (err, result) => {
                  connection.release()
                  if (err) reject(err);
                  console.log(result)
                  console.log('Image Entry Deleted');
              });

            } else {

              filesLength = deletedBannerImages.length

              //Delete Entries for Deleted Images in Database First
              for (let i = 0; i < filesLength; i++) {
              
                imageValues = [req.body.fileNameBanner[i], userID];
                console.log(imageValues);

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
            await deleteImages('bannerImage', 'banner', connection, deletedBannerImages);
        
          }

          const userColorUpdate = 
          `UPDATE user SET navColor = ? WHERE userID = ?`

          const userValues = [userTheme, userID];

          const userUpdate = mysql.format(userColorUpdate, userValues);

          connection.query (userUpdate, (err, result) => {
            console.log(result);
            connection.release();
            if (err) reject (err);
          });

          const update = 
          `UPDATE aboutme SET 
            content = ?,
            updatedDate = ?,
            fileAmount = fileAmount + ? - ?,
            aboutMeFiles = aboutMeFiles + ? - ?,
            bannerContent = ?,
            aboutMeColor = ?
          WHERE userID = ?;`

          const values = [
            content,
            newDate, 
            fileAmount,
            deletedBannerImagesAmount,
            aboutMeFiles,
            deletedAboutMeImagesAmount,
            bannerContent,
            color,
            userID
          ] 

          console.log(values);

          const aboutMeContentUpdate = mysql.format(update, values);
  
          connection.query (aboutMeContentUpdate, (err, result) => {

            console.log(result);

            connection.release();
            if (err) reject(err);
            return resolve(result);
            
          })

        })

      })

      if (indexPhotos) {
        //Easier and more concise to piggyback existing photo editor page
        res.redirect('/blogEdit2?indexPhotos=' + indexPhotos + 
                    '&oldAboutMeFiles=' + aboutMeFileField);
                    
      } else {
        res.redirect('/');
      }

    } catch {

      res.redirect('/editAboutMe');
      console.log('ERROR');

    }

  })


}