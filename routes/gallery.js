//Express
const express = require('express')

//Base Functions
const functions = require('./function')

//Authentication 
const checkAuthenticated = functions.checkAuthenticated

//Unix Time Conversion
const timeConverter = functions.timeConverter

//Mysql Functionality
const mysql = require('mysql2')

//Database Configuration
const database = require('./database.js')
const db = database.db

//Multer for Disk Storage Pathing
const multer  = require('multer')

    //Uploading Engine
    const uploading = require('./engines/galleryImages')

    const galleryUpload = uploading.galleryUpload

//FS for File Directory Pathing, may be Unnecessary
const fs = require('fs') 

module.exports = app => {

    //*********GET REQUESTS*********//

    //Public Gallery
    app.get('/gallery', (req, res) => {
    db.getConnection( async (err, connection) => {
      if (err) throw (err)
      const sqlSearch = "SELECT * FROM gallery;"
      const galleryResult = mysql.format(sqlSearch)
  
      connection.query (galleryResult, (err, result) => {
        connection.release()
        if (err) throw (err)
  
        const gallery = result
  
        res.render('gallery',
        {
           gallery, 

          //Header
          originalUrl : req.originalUrl,
          isAuthenticated : req.isAuthenticated(),

          timeConverter 

        })
      })
    })
  })
  
    //Photo Editing Page
  app.get('/editGallery', checkAuthenticated, (req, res) => {
    db.getConnection( async (err, connection) => {
      if (err) throw (err)
      const sqlSearch = "SELECT * FROM gallery;"
      const galleryResult = mysql.format(sqlSearch)
  
      connection.query (galleryResult, (err, result) => {
        connection.release()
        if (err) throw (err)
  
        const gallery = result
  
        res.render('editGallery', 
        { 
          gallery, 

          //Header
          originalUrl : req.originalUrl,
          isAuthenticated : req.isAuthenticated(),

          timeConverter 
        })
      })
    })
  })
  
  //*********POST REQUESTS*********//
  
  app.post('/photoUpload', 
   galleryUpload.array('galleryImages'),
   checkAuthenticated, 
   async (req, res) => {
    try {
  
      const date = req.body.newDate
  
      const fileAmount = req.files.length 
  
      await new Promise ((resolve,reject) => {
        db.getConnection( async (err, connection) => {
        if (err) throw (err)
  
        const sqlInsert = "INSERT INTO gallery (uploadedAt, name) VALUES ?"
  
        const values = []
        
        for (let i = 0; i < fileAmount; i++) {
          values.push([date, req.files[i].filename])
        }

        const insertImages = mysql.format(sqlInsert, [values])
  
        connection.query (insertImages, (err, result) => {
          connection.release()
          if (err) reject(err)
          console.log(err,result)
          return resolve(result)
          })
        })
      })
  
    res.redirect('/editGallery')
  
    } catch {
  
    res.redirect('/editGallery')
    console.log('ERROR')
  
    } 
  })

  app.put('/photoUpdate', checkAuthenticated, async (req, res) => {
    try {

      console.log(req.body)
      const response = req.body

      const valuesArray = [];

      for (const key in response) {
        const values = response[key]

        valuesArray.push(values)

      }

      await new Promise ((resolve,reject) => {
        db.getConnection( async (err,connection) => {

          if (err) reject(err)

          count = 0

          //Experimenting with Possible Insertion Techniques
          //loop through the array in steps of 3
          //each packet of data is put into valuesArray in sets of 3
          //so even though the data isn't divided up by photo, the data is predictable

          for (let i = 0; i < valuesArray.length; i += 3) {

            const caption = valuesArray[i]
            const date = valuesArray[i + 1]
            const name = valuesArray[i + 2]

            console.log(caption, date, name)

            const capUpdate = `UPDATE gallery
            SET 
              caption = ?
            WHERE uploadedAt = ? AND name = ?`

            const capUpdateQuery = mysql.format(capUpdate, [caption, date, name])
            
            // execute the MySQL query for this set of values
            connection.query(capUpdateQuery, (err, result) => {

              connection.release()

              if (err) reject(err)
              console.log(`Updated caption for ${name}`)

              count++
            
              if (count === valuesArray.length/3) {
                return resolve(result)
              }

            });

          }

        })

      })

      res.redirect('/gallery')

    } catch {

      res.redirect('/editGallery')

    }
  })
  
  app.delete('/photoDelete', checkAuthenticated, async (req, res) => {
    try {

      //Condense req.body for readability 
      const response = req.body
  
      //Get Keys to Match ID Column in MySQL DB
      const keysArray = []
  
      //Keys Array Needs to Equal Names Array for Loop and File Delete to Work Together
      const namesArray = []
      
      for (const key in response) {
        const values = response[key];
        const valuesArray = []
        //Obj Values are Strings if 1:1 with Object Keys, e.g. { key : name }
        //Obj keys need to be 1:1 due to the way the way the files are deleted, i.e.,
        //the function looks for the folder (UNIX timestamp value held in the DB) AND the file name
        if (typeof values == "string") {
            valuesArray.push(values)
            for (let i = 0; i < valuesArray.length; i++) {
            keysArray.push(key);
            namesArray.push(valuesArray[i]);
          }
        //Else Obj Values are Held in Arrays, e.g. { key : [ name 1, name 2 ] }
        } else {
          for (const value of values) {
            keysArray.push(key);
            namesArray.push(value);
            }
          }
        }
  
        await new Promise ((resolve,reject) => {

          db.getConnection( async (err, connection) => {
            if (err) reject(err)
  
            //Delete By Photo ID, Unique Auto-Incrementing Value
            const photoDelete = 'DELETE FROM gallery WHERE uploadedAt = ? AND name = ?'
            
            //Remove Files Based on File Name

            for (let i = 0; i < namesArray.length; i++) {

              //Sets Up Query, The keysArray index and namesArray index correspond to the same object (req.body)
              var deleteQuery = mysql.format(photoDelete, [keysArray[i], namesArray[i]])
      
              //Activates Query
              connection.query (deleteQuery, (err, result) => {
                console.log(err)
                if (err) reject(err) 
              }) 
              //The arrays act as a double check in case the same photo is uploaded multiple times 
              fs.rmSync(`./public/images/galleryImages/${keysArray[i]}/${namesArray[i]}`, { recursive: true, force: true })
              try {
                fs.rmdirSync(`./public/images/galleryImages/${keysArray[i]}`)
                console.log(`Directory ${keysArray[i]} Deleted`)
              } catch {
                console.log(`Directory ${keysArray[i]} Still Contains Photos`)
              }

            }
            
          return resolve(connection.release())
            
      })
  
    })
  
    res.redirect('/gallery')
      
    } catch {
    res.redirect('/editGallery')
    console.log('ERROR')
    } 
  
  })

}
