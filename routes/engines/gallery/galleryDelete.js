//.env 
require('dotenv').config()

//S3 Specific Classes
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.BUCKET

async function deleteKey(subdirectory, object, callback) {

    console.log(subdirectory, object)

    const deleteParams = {
      Bucket: bucketName,
      Key: `galleryImages/${subdirectory}/${object}`,
    };
  
    console.log(deleteParams)

    try {
      await s3.send(new DeleteObjectCommand(deleteParams));
      console.log(`Successfully deleted object: ${subdirectory}/${object}`);
    } catch (error) {
      console.log(`Error deleting object: ${subdirectory}/${object}`, error);
    }

    if (callback) {
        callback()
    }

  }

module.exports = {
    deleteKey : deleteKey
}