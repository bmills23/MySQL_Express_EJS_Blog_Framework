//require deleteBlogKey
const { deleteImageKey } = require('../aboutme/aboutMeImagesDelete');

//Mysql Functionality
const mysql = require('mysql2');

//Get the UserID  
require('dotenv').config();
const userID = process.env.ID;

async function deleteImages (imageType, subdirectory, connection, deletedFiles) {

    if (typeof deletedFiles === 'string') {
        const rowSql = `SELECT * FROM aboutMeImages WHERE imageType = '${imageType}' AND src = ? AND userID = ? LIMIT 1`;
        const rowValues = [deletedFiles, userID];
        const query = mysql.format(rowSql, rowValues)
        connection.query(query, (err, rows) => {
            connection.release();
            if (err) throw err;
    
            if (rows.length === 0) {
              deleteImageKey(subdirectory, deletedFiles, () => {
                console.log('S3 object deleted');
              })
            };
        });
    
    } else {
        deletedFiles.forEach(file => {
        const rowSql = `SELECT * FROM aboutMeImages WHERE imageType = '${imageType}' AND src = ? AND userID = ? LIMIT 1`;
        const rowValues = [file, userID];
        const query = mysql.format(rowSql, rowValues)
            connection.query(query, (err, rows) => {
                connection.release();
                if (err) throw err;
    
                    if (rows.length === 0) {
                    deleteImageKey(subdirectory, file, () => {
                        console.log('S3 object deleted');
                    })
                };
            });
        });
    };

}

module.exports = {
    deleteImages : deleteImages
}
