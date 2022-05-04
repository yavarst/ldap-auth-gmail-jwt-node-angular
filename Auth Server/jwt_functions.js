const config = require('./config.json');
const jwt = require('jsonwebtoken');

// Database related functions are stored here.
const dbFunctions = require('./db_functions')


// Function for generating access token with the given payload.
module.exports.generateToken = (payload) => {

    return jwt.sign(payload , config['jwt-config'].access_token_secret, { expiresIn: config['jwt-config'].token_expire_time })

}

// Function for generating refresh token with the given payload.
module.exports.generateRefresh = (payload) => {

  refreshToken = jwt.sign(payload, config['jwt-config'].refresh_token_secret)

  // We need to store the generated refresh token, so where better than a database ?
  dbFunctions.executeQuery(`INSERT INTO \`refresh_token\` VALUES('${refreshToken}')`)

  return refreshToken

}

// Access token authentication middleware.
module.exports.authenticateToken = (req, res, next) => {

    // Getting access token from the authorization header:
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // If the token does not exist, return 401 status:
    if(token == null || token == undefined) return res.sendStatus(401);
  
    // Checking if the access token is valid:
    jwt.verify(token, config['jwt-config'].access_token_secret, (error, payload) => {

      // If the token is invalid, return 403 status:
      if (error) return res.sendStatus(403);

      // If the token is valid, the payload will stored in req parameter for further uses:
      req.payload = payload;
      next();

    })
    
  }

  // Refresh token authentication middleware.
  module.exports.authenticateRefresh = async (req, res, next) => {

    // Getting refresh token from the authorization header:
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    // If the token does not exist, return 401 status:
    if(token == null || token == undefined) return res.sendStatus(401);
    
    // After getting token from authorization header, first of all we need to check if it exists in the database:
    dbFunctions.executeQuery(`SELECT \`refresh_token\` FROM \`refresh_token\` WHERE refresh_token='${token}'`)
    .then((row) => {
      
      if (row[0]){

        // Checking if the refresh token is valid:
        jwt.verify(token, config['jwt-config'].refresh_token_secret, (error, payload) => {

          // If the token is invalid, return 403 status:
          if (error) return res.sendStatus(403);

          // If the token is valid, the payload will stored in req parameter for further uses:
          req.payload = payload;
          next();
          
        })
  
      }
      else {
  
        res.status(403);
        res.send('Invalid token!')
  
      }

    }).catch((err) => {

      res.status(500);
      res.send(err)

    })
    
  }

  // Function for removing refresh token.
  module.exports.removeRefresh = (refreshToken) => {

    // Removing the refresh token from database.
    dbFunctions.executeQuery(`DELETE FROM \`refresh_token\` where refresh_token='${ refreshToken }'`).then(() => { })

  }

  