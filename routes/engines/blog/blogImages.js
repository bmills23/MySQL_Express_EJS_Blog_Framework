//.env
require('dotenv').config();

//Multer for Disk Storage Pathing & AWS S3 Compatability 
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

//Upload with File Restrictions
const upload = multer({ 
  storage: multerS3({
    s3 : s3,
    bucket : process.env.BUCKET,
    metadata : function (req, file, cb) {
      cb(null, {fieldName : file.fieldname})
    },
    key: function (req, file, cb) {
      cb(null, 'blogImages/' + req.body.date + '/' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid File Type; Must be jpeg, png or gif.'));        
    }
  } 
})

module.exports = {
  upload : upload
}
