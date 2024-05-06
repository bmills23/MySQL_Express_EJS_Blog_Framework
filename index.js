//loads env variables
require('dotenv').config();
const userID = process.env.ID;

//Required External Modules

const express = require('express');

const app = express();
const path = require('path');

const passport = require('passport');
const flash = require('express-flash');
const session = require('cookie-session');

//Crucial for Correct REST & CRUD Ops in Express
const methodOverride = require('method-override');

// put the HTML file containing your form in a directory named "public" (relative to where this script is located)
app.get("/", express.static(path.join(__dirname, "./public")));

//Mysql Functionality
const mysql = require('mysql2');

//Database Configuration
const { db } = require('./routes/database');

//Passport & Passport Config
const initializePassport = require('./passport-config');

//Color Functions
const { getTextColor } = require('./routes/engines/functions/luminance');
 
//Fetches User Data from DB for Passport 
initializePassport(
  passport,
  email => {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err)
        const q = 
        `SELECT * FROM user 
        WHERE email = ? AND id = ?`
        const query = mysql.format(q, [email, userID])
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
        const q = 
        `SELECT * FROM user 
        WHERE id = ?`
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
app.use(express.static(path.join(__dirname, '/public')));

//Bootstrap Node Dependecies
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

//Views Pathing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

//Takes Inputs from Forms for Post Methods
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false, //resaves if something has changed in session
  saveUninitialized: false, //don't want to save empty values in session
  maxAge: 60 * 60 * 1000, //1 hour
  cookie: {
    secure: true
  }
}));

//Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

//Method Override for Post because DELETE is non functional in express, see Logout for example
//Need this to create RESTful routes in express 
app.use(methodOverride('_method'));

app.use(async (req, res, next) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, connection) => {
      if (err) reject(err);

      const query = "SELECT * FROM user WHERE userID = ?;";
      const search = mysql.format(query, userID);

      connection.query(search, (err, results) => {
        connection.release(); 

        if (err) reject(err);

        const user = results;

        res.locals.user = user;

        res.locals.socialData = user[0].social;

        res.locals.year = new Date().getFullYear();

        res.locals.getTextColor = getTextColor;

        res.locals.bucket = process.env.BUCKET;

        console.log(res.locals.user);

        // Call next() inside the promise's then block
        resolve();
      });
    });
  })
  .then(() => {
    next(); // Call next() after the promise resolves
  })
  .catch((err) => {
    // Handle errors
    console.error(err);
    next(err); // Pass the error to the next middleware
  });
});


//JS Imports
const authGets = require('./routes/auth/authGets'); //auth Includes Login & Register
const authPosts = require('./routes/auth/authPosts'); //authPosts includes Logout Delete Request

//Index Page
const index = require('./routes/indexpage');

//Blog Http Methods

  //GETS
  const blogGets = require('./routes/blog/blogGets');

  //POST Methods
  const blogPost = require('./routes/blog/blogPost');
  const blogInput2Post = require('./routes/blog/blogInput2Post');
  const blogUpdatePost = require('./routes/blog/blogUpdatePost');

  //PUT Methods
  const blogPuts = require('./routes/blog/blogPuts');

  //Delete Methods
  const blogDeletes = require('./routes/blog/blogDeletes');

  //Register Method
  // const register = require('./routes/register')

//Gallery Page
const gallery = require('./routes/gallery');

//Get and Post Routes : See Routes Folder
authGets(app);
authPosts(app);

index(app);

blogGets(app);

blogPost(app);
blogUpdatePost(app);
blogInput2Post(app);

blogPuts(app);

blogDeletes(app);

gallery(app);

// Unused
// register(app);

// *************************************
// HEY, LISTEN
// *************************************

app.listen(process.env.PORT);

