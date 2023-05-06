//Multer for Disk Storage Pathing
const multer  = require('multer')

//FS for File Directory Pathing
const fs = require('fs')  

//Setup Gallery Photos Upload Pathing
const galleryStorage = multer.diskStorage({

    destination: async function (req, file, cb) {
        
        const path = `./public/images/galleryImages/${req.body.newDate}`
        fs.mkdirSync(path, { recursive : true }, (err) => {
            if (err) throw (err)
        })
        return cb(null, path)
    },
    
    filename: async function (req, file, cb) {
        cb(null, file.originalname)
    }
    
})
    
//Export the Finished Engine
module.exports = {

    galleryUpload : multer({ storage: galleryStorage })

}

