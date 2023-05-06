//Express
const express = require('express')

//Base Functions
const functions = require('./function.js')

    //Authentication 
    const checkAuthenticated = functions.checkAuthenticated

    //Unix Time Conversion
    const timeConverter = functions.timeConverter

//Mysql Functionality
const mysql = require('mysql2')

//Database Configuration
const database = require('./database')
const db = database.db

module.exports = app => {

    //*********GET REQUESTS*********//

    //Public Blog
    app.get('/blogs', (req, res) => {

        db.getConnection( async (err, connection) => {
        if (err) throw (err)

        //Select Post Database, Where Blog content is held 
        const sqlSearch = "SELECT * FROM post;"
        const blogResult = mysql.format(sqlSearch)
    
        connection.query (blogResult, (err, result) => {
            connection.release()
            if (err) throw (err)
    
            const blogs = result
        
            res.render('publicBlogList', 
            { 
              blogs, 
              
              //Header
              originalUrl : req.originalUrl,
              isAuthenticated : req.isAuthenticated(),
              
              timeConverter 
            })

          })

        })
    
    })

    //Separate Blog Posts
    app.get('/blog/:id', (req, res) => {

        //Express Public Directory
        app.use('/blog/:id', express.static(__dirname + '/public'));

        db.getConnection( async (err, connection) => {
            if (err) throw (err)
            const sqlSearch = "SELECT * FROM post WHERE id = ?;"
            const blogResult = mysql.format(sqlSearch, req.params.id)

            const imageSearch = "SELECT uploadedAt FROM post WHERE id = ?;"
            const imageResult = mysql.format(imageSearch, req.params.id)

            //Begin Nested connection queries to build tree of values to be rendered
            connection.query (imageResult, (err,result) => {
              if (err) throw (err)

              //Returns number in array of objects, needs to be converted to string
              const imageDate = result;
              
              console.log(imageDate)

              const imagesByDate = "SELECT * FROM blogImages WHERE uploadedAt = ?;"

              //Select Blog Images where UNIX value from ID
              const imagesResult = mysql.format(imagesByDate, imageDate[0].uploadedAt.toString())

              connection.query (imagesResult, (err, result) => {
                if (err) throw (err) 

                const images = result;

                  connection.query (blogResult, (err, result) => {
                    connection.release()
                    if (err) throw (err)
    
                    const blog = result;
       
                    res.render('individualBlog', 

                    { 
                      images, blog,
                      
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

    // Eyes Only Blogging
    app.get('/blogInput', checkAuthenticated, (req, res) => {
        res.render('blog', 
        { 
          //Header
          originalUrl : req.originalUrl,
          isAuthenticated : req.isAuthenticated(), 
        })
    })

    // Eyes Only Blogging
    app.get('/blogEdit2', checkAuthenticated, (req, res) => {

        //Take the token generated in the initial post method (see blogInput.post)
        const token = req.session.token || false

        if (!token) {
          // if the token is not found in the session, sends error message
          // side-note, back-ticks allow back-end HTML input
          res.send(`Error: Invalid or Expired Token; Please edit blog post in Edit Individual Blogs Tab.
          <br>
          <br>
          <a href="/"><button>Click Here To Return to Home Page</button></a>`)
    
        } else {

          // if the token is found
          req.session.token = null; // delete the token from the session
          res.clearCookie('token'); // delete the token from the cookie if (!token) 

          if (!req.query.indexPhotos) {

            //UploadedAt Should Be Sent for Image Editing
            const uploadedAt = req.query.uploadedAt

            const newFiles = req.query.fileAmount

            db.getConnection( async (err, connection) => {
              if (err) throw (err)

              //May have to pass additional params to restrict search
              const imageSql = "SELECT * FROM blogImages WHERE uploadedAt = ?;"
              const imageSearch = mysql.format(imageSql, uploadedAt)

              const postSql = "SELECT * FROM post WHERE uploadedAt = ?;"
              const postSearch = mysql.format(postSql, uploadedAt)
               
              connection.query (postSearch, (err, result) => {
                if (err) throw (err)

                const blog = result

                  connection.query (imageSearch, (err, result) => {
                    connection.release()
                    if (err) throw (err)

                    const images = result

                      res.render('blogStep2', {
                        blog, images,
                        newFiles: newFiles,

                        //header
                        originalUrl: req.originalUrl,
                        isAuthenticated: req.isAuthenticated(),

                        newBlog: req.query.newBlog,
                
                        timeConverter
                      });

                  })

              })

            })
          
          } else {

            db.getConnection( async (err, connection) => {
              if (err) throw (err)

              //Only one entry for aboutMe
              const aboutMeSearch = "SELECT * FROM aboutme;"


              connection.query (aboutMeSearch, (err, result) => {
                  if (err) throw (err)
                  
                  const aboutMe = result

                  res.render('blogStep2', {
                    aboutMe,

                    indexPhotos: req.query.indexPhotos,

                     //header
                    originalUrl: req.originalUrl,
                    isAuthenticated: req.isAuthenticated(),

                    timeConverter
                  })

              })

            })

        }

      }
       
    })

    // Edit List of Blogs (blogEditList.ejs)
    app.get('/blogEditList', checkAuthenticated, (req, res) => {

        db.getConnection( async (err, connection) => {
            if (err) throw (err)
            const sqlSearch = "SELECT * FROM post;"
            const blogResult = mysql.format(sqlSearch)

            connection.query (blogResult, (err, result) => {
            connection.release()
            if (err) throw (err)

            const blogs = result
            
            res.render('blogEditList', 
            { 
              blogs, 

              //Header
              originalUrl : req.originalUrl,
              isAuthenticated : req.isAuthenticated(),

              timeConverter 
            })

            })

        })

    })

    //Edit Separate Blog Posts (blogEdit.ejs)
    app.get('/blogEdit/:id', checkAuthenticated, (req, res) => {

        //Express Public Directory
        app.use('/blogEdit/:id', express.static(__dirname + '/public'));

        db.getConnection( async (err, connection) => {
            if (err) throw (err)
            const sqlSearch = "SELECT * FROM post WHERE id = ?;"
            const blogResult = mysql.format(sqlSearch, req.params.id)

            connection.query (blogResult, (err, result) => {
                connection.release()
                if (err) throw (err)

                const blog = result 
                    
                res.render('blogEdit', 
                { blog, 
                  
                  //Header
                  originalUrl : req.originalUrl,
                  isAuthenticated : req.isAuthenticated(),

                  timeConverter })

            })
        })

    })
}