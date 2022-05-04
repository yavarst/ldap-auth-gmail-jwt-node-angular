const mysql = require('mysql');

// The whole configuration of Auth server is stored here.
const config = require('./config.json');


// A simple function for executing MySQL queries.
 module.exports.executeQuery = (query) => {

    return new Promise((resolve, reject) => {
        
        // Creating a MySQL connection based on data in the config file:
        let dbConnection = mysql.createConnection({
            host: config['mysql-config'].hostName,
            database: config['mysql-config'].database,
            user: config['mysql-config'].username,
            password: config['mysql-config'].password
        })

        dbConnection.connect()

        dbConnection.query(query, (err, result) => {

            if (err) 
                reject(new Error('Error occured executing query!'))

            else
                resolve(result)

        })

        dbConnection.end()
      
    })

  }