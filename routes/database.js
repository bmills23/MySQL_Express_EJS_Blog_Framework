require('dotenv').config()
const mysql = require('mysql2')

const DB_URL = process.env.DB_URL

module.exports = {
    //Database configuration

    db : mysql.createPool(DB_URL)

}