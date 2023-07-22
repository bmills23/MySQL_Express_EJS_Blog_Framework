//require deleteBlogKey
const { deleteBlogKey } = require('../blog/blogImagesDelete');

//Mysql Functionality
const mysql = require('mysql2');

//Get the UserID 
require('dotenv').config();
const userID = process.env.ID;

async function deleteFiles (connection, uploadedAt, deletedFiles) {

    if (typeof deletedFiles === 'string') {
        const rowSql = 'SELECT * FROM blogImages WHERE uploadedAt = ? AND src = ? AND userID = ? LIMIT 1';
        const rowValues = [uploadedAt, deletedFiles, userID];
        const query = mysql.format(rowSql, rowValues)
        connection.query(query, (err, rows) => {
            connection.release();
            if (err) throw err;
    
            if (rows.length === 0) {
              deleteBlogKey(uploadedAt, deletedFiles, false, () => {
                console.log('S3 object deleted');
              })
            };
        });
    
    } else {
        deletedFiles.forEach(file => {
        const rowSql = 'SELECT * FROM blogImages WHERE uploadedAt = ? AND src = ? AND userID = ? LIMIT 1';
        const rowValues = [uploadedAt, file, userID];
        const query = mysql.format(rowSql, rowValues)
            connection.query(query, (err, rows) => {
                connection.release();
                if (err) throw err;
    
                    if (rows.length === 0) {
                    deleteBlogKey(uploadedAt, file, false, () => {
                        console.log('S3 object deleted');
                    })
                };
            });
        });
    };

}

module.exports = {
    deleteFiles : deleteFiles
}
