//Express
const express = require('express')

//uuid for unique token generation
const crypto = require('crypto')

//Base Functions
const functions = require('./function')

    //Unix Time Conversion
    const timeConverter = functions.timeConverter

    //Check Authenticated
    const checkAuthenticated = functions.checkAuthenticated

//Mysql Functionality
const mysql = require('mysql2')

//Database Configuration
const database = require('./database.js')
const db = database.db

//Console.Log Early Warning, Will Fire with Index Get
db.getConnection( (err, connection) => {
    console.log(err)
    if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)
})

//Multer for Disk Storage Pathing
const multer  = require('multer')

//FS for File Directory Pathing, may be Unnecessary
const fs = require('fs') 

module.exports = app => {
    
    //*********GET REQUESTS*********//

    //Index 
    app.get('/', (req, res) => {
        db.getConnection( async (err, connection) => {
            if (err) throw (err)

            //Query About Me Table
            const sqlSearch = "SELECT * FROM aboutme;"

            //Query Blog Posts
            const blogSearch = "SELECT * FROM post;"

            //Query blogImages 
            const imageSearch = "SELECT * FROM blogImages;"
        
            connection.query (sqlSearch, (err, result) => {
              if (err) throw (err)

              const aboutMe = result

              connection.query (blogSearch, (err, result) => {
                if (err) throw (err)

                const blogs = result

                connection.query (imageSearch, (err, result) => {
                  connection.release()
                  if (err) throw (err)

                  const images = result


                  res.render('index', 
                  {
                    aboutMe, blogs, images,

                    //Header
                    originalUrl : req.originalUrl,
                    isAuthenticated : req.isAuthenticated(),
                    
                    timeConverter
                  })  

                  })

              })       

            })
        })
    })

    //Eyes Only Edit Index Page
    app.get('/editAboutMe', checkAuthenticated, (req, res) => {
        db.getConnection( async (err, connection) => {
          if (err) throw (err)
          const sqlSearch = "SELECT * FROM aboutme;"
          const aboutMeResult = mysql.format(sqlSearch)
      
          connection.query (aboutMeResult, (err, result) => {
            connection.release()
            if (err) throw (err)
      
            const aboutMe = result 
          
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

    //Index About Me Photos Upload Engine
    const aboutMeStorage  = multer.diskStorage({

      destination: async (req, file, cb) => {
        if (file.fieldname === 'aboutMeImage') {
          cb(null, './public/images/index/aboutme/')
        } else if (file.fieldname === 'bannerImage') {
          cb(null, './public/images/index/banner/')
        }
      },

      filename: (req, file, cb) => {
        if (file.fieldname === 'bannerImage') {
          cb(null, req.files.bannerImage.length + '.jpeg')
        } else {
          cb(null, req.files.aboutMeImage.length + '.jpeg')
        }
      },

    });

    //Middleware to Delete Existing Files in the Index Image Directories
    //Just upload new photos to replace all the old for ease
    const deleteExistingFilesMiddleware = async (req, res, next) => {

      const bannerFolderPath = './public/images/index/banner'
      const aboutMeFolderPath = './public/images/index/aboutme'
    
      const unlinkPromises = []
    
      const bannerFiles = await fs.promises.readdir(bannerFolderPath)
      for (const file of bannerFiles) {
        unlinkPromises.push(fs.promises.unlink(`${bannerFolderPath}/${file}`))
      }
    
      const aboutMeFiles = await fs.promises.readdir(aboutMeFolderPath)
      for (const file of aboutMeFiles) {
        unlinkPromises.push(fs.promises.unlink(`${aboutMeFolderPath}/${file}`))
      }
    
      await Promise.all(unlinkPromises)
    
      next()
    
    }
  
    //Setup the Multer Update Object for About Me Photos
    const aboutMeUpdate = multer({
       storage: aboutMeStorage,
       fileFilter: (req, file, cb) => {
          const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
          if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
          } else {
            cb(new Error('Invalid File Type; Must be jpeg, png or gif.'))
          }
       }
    })

    //Update About Me, Put Only Because the DB is seeded; see extraneousfunctions.js
    app.put('/aboutMeUpdate', 
    //Call the middleware to delete files first
    deleteExistingFilesMiddleware,
    //Then call the function to upload new files
    aboutMeUpdate.fields([
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

        console.log('PUT Method AboutMeUpdate')

        /*Generate a token to pass to next blogInput2 page;
        this will ensure that client cannot return to the previous page at any point;
        throws an error as defined in get*/
        const token = crypto.randomBytes(16).toString('hex')
        req.session.token = token
        res.cookie('token', token, { httpOnly : true })

        const fileAmount = req.files.bannerImage.length

        const aboutMeFiles = req.files.aboutMeImage.length

        //About Me Content 
        const newContent = req.body.aboutMeUpdate
       //Same Functionality as the blogInput
        //Splits Content into Different Paragraphs in an array based on line breaks
        const paragraphs = newContent.split('\n')

        //Regex wraps each paragraph in paragraph tags, allowing for image prepend/append
        const templates = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)

        //Rejoin templates into single string of HTML content 
        let content = templates.join('')

        //Updated Date
        const newDate = req.body.newDate

        const indexPhotos = true
    
        await new Promise ((resolve,reject) => {
            db.getConnection( async (err, connection) => {
            if (err) reject(err)
    
            const update = 
            `UPDATE aboutme SET 
              content = ?,
              updatedDate = ?,
              fileAmount = ?,
              aboutMeFiles = ?;`

            const values = [
              content,
              newDate, 
              fileAmount,
              aboutMeFiles
            ] 

            const aboutMeContentUpdate = mysql.format(update, values)
    
            connection.query (aboutMeContentUpdate, (err, result)=> {

              console.log(result)

              connection.release()
              if (err) reject(err)
              return resolve(result)
              
            })

        })

      })
    
      //Easier and more concise to piggyback existing photo editor page
      res.redirect('/blogEdit2?indexPhotos=' + indexPhotos)

    } catch {

      res.redirect('/editAboutMe')
      console.log('ERROR')

    }

  })


}