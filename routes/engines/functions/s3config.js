//This function is intended to get the names of each url, but it may be totally unnecessary

//.env
require('dotenv').config();

//AWS Cognito Configurations
const { CognitoIdentityClient } = require("@aws-sdk/client-cognito-identity");
const { fromCognitoIdentityPool } = require("@aws-sdk/credential-provider-cognito-identity");
const { S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3");

const albumBucketName = process.env.BUCKET

const REGION = process.env.USER_REGION; // Replace with your region
const IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID; // Replace with your identity pool ID

const client = new CognitoIdentityClient({ region: REGION });
const credentials = fromCognitoIdentityPool({
    client,
    identityPoolId: IDENTITY_POOL_ID
});

const s3 = new S3Client({
    region: process.env.REGION,
    apiVersion: '2006-03-01',
    Bucket: albumBucketName,
    credentials: credentials,
});

// Define a function to list all the image objects in the galleryImages directory
async function listImages(prefix) {
    
    const params = {
        Bucket: albumBucketName,
        Prefix: prefix
    }    

    const command = new ListObjectsCommand(params)
    
    // Use the listObjectsV2 method to list all the objects in the galleryImages directory
    const response = await s3.send(command) 

    // Parse the response to get the URLs of all the image objects
    const imageUrls = response.Contents.filter(item => 
        item.Key.endsWith('.jpg') || 
        item.Key.endsWith('.png') || 
        item.Key.endsWith('.jpeg') ||
        item.Key.endsWith('.gif')).map(item => `https://${albumBucketName}.s3.amazonaws.com/${item.Key}`);

    return imageUrls

}

module.exports = {
    listImages : listImages
}