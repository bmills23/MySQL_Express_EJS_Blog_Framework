//Multer for Disk Storage Pathing
const multer  = require('multer')

//FS for File Directory Pathing
const fs = require('fs')  

//Setup Photo Upload Pathing Engine
const storage = multer.diskStorage({

    destination: async function (req, file, cb) {

        //Creates New Folder Based off of Unix Upload Date
        const path = `./public/images/blogImages/${req.body.date}`
        try {
        if (!fs.existsSync(path)) {
            console.log('Directory Exists')
            fs.mkdirSync(path, { recursive : true })
        } 
        } catch (err) {
            console.log("Destination Error")
        } return cb(null, path)

    },

    filename: async function (req, file, cb) {
        
        const path = `./public/images/blogImages/${req.body.date}/${file.originalname}`
        let fileName = file.originalname

        try {

            cb(null, fileName)
            
        } catch {
            console.log("Filename Error")
        }
    }
})

//Export The Finished Engine
module.exports = {

    //Upload with File Restrictions
    upload : multer({ 
      storage: storage,
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('Invalid File Type; Must be jpeg, png or gif.'))          
        }
      } 
    })

}

