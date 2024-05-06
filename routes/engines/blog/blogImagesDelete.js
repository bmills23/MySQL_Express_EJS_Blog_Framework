//.env 
require('dotenv').config()

//S3 Specific Classes
const { S3Client, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.BUCKET;

async function deleteBlogKey(subdirectory, object, deleteAll, callback) {

  if (deleteAll) {

    console.log('Deleting all Photos in S3 Subdirectory')

    const deleteParams = {
      Bucket: bucketName,
      Prefix: `blogImages/${subdirectory}/`
    };

    console.log(deleteParams)

    // List all objects with the specified prefix
    const listResult = await s3.send(new ListObjectsV2Command(deleteParams));

    console.log(listResult);

    const objectsToDelete = listResult.Contents.map((obj) => ({
      Key: obj.Key,
    }));

    if (objectsToDelete.length === 0) {
      console.log(`No objects found for prefix: blogImages/${subdirectory}/`);
      if (callback) {
        callback();
      }
      return;
    }
  

    // Delete all objects found in the list
    const deleteObjectsParams = {
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    };
  
    await s3.send(new DeleteObjectsCommand(deleteObjectsParams));

    console.log(`Successfully deleted objects with prefix: blogImages/${subdirectory}/`);

    if (callback) callback();

  } else {

    console.log(subdirectory, object)

    const deleteParams = {
      Bucket: bucketName,
      Key: `blogImages/${subdirectory}/${object}`,
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
    
}

module.exports = {
    deleteBlogKey : deleteBlogKey
}