if (process.env.NODE_ENV !== 'production') { //loads env variables if app not in development
  require('dotenv').config()
}

//Required External Modules

const express = require('express')

const app = express()
const path = require('path')

const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

//Crucial for Correct REST & CRUD Ops in Express
const methodOverride = require('method-override')

// put the HTML file containing your form in a directory named "public" (relative to where this script is located)
app.get("/", express.static(path.join(__dirname, "./public")))

//Passport & Passport Config
const initializePassport = require('./passport-config')

//Mysql Functionality
const mysql = require('mysql2')

//Database Configuration
const database = require('./routes/database')
const db = database.db

//Fetches User Data from DB for Passport 
initializePassport(
  passport,
  email => {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err)
        const q = "SELECT * FROM user WHERE email = ?"
        const query = mysql.format(q, [email])
        return connection.query(query, (err, results) => {
          connection.release()
          if (err) return reject(err)
          return resolve(results[0])
        })
      })
    })
  },
  id => {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err)
        const q = "SELECT * FROM user WHERE id = ?"
        const query = mysql.format(q, [id])
        return connection.query(query, (err, results) => {
          connection.release()
          if (err) return reject(err)
          return resolve(results[0])
        })
      })
    })
  }
)

//Express Public Directory
app.use(express.static(path.join(__dirname, '/public')))

//Bootstrap Node Dependecies
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))

//Views Pathing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))

//Takes Inputs from Forms for Post Methods
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, //resaves if something has changed in session
  saveUninitialized: false, //don't want to save empty values in session
  cookie: {
    maxAge: 60 * 60 * 1000, // 1 hour
  }
}))

//Passport Configuration
app.use(passport.initialize())
app.use(passport.session())

//Method Override for Post because DELETE is non functional in express, see Logout for example
//Need this to create RESTful routes in express 
app.use(methodOverride('_method'))

//JS Imports
const authGets = require('./routes/authGets') //auth Includes Login & Register
const authPosts = require('./routes/authPosts') //authPosts includes Logout Delete Request

//Index Page
const index = require('./routes/indexpage') 

//Blog Http Methods

  //GETS
  const blogGets = require('./routes/blogGets')

  //POST Methods
  const blogPost = require('./routes/blogPost')
  const blogInput2Post = require('./routes/blogInput2Post')
  const blogUpdatePost = require('./routes/blogUpdatePost')

  //PUT Methods
  const blogPuts = require('./routes/blogPuts')

  //Delete Methods
  const blogDeletes = require('./routes/blogDeletes')

//Gallery Page
const gallery = require('./routes/gallery')

//Get and Post Routes : See Routes Folder
authGets(app)
authPosts(app)

index(app)

blogGets(app)

blogPost(app)
blogUpdatePost(app)
blogInput2Post(app)

blogPuts(app)

blogDeletes(app)

gallery(app)

// *************************************
// HEY, LISTEN
// *************************************

app.listen(process.env.PORT || 3000)

