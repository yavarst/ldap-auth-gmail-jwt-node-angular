const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// The whole configuration of Auth server is stored here.
const config = require('./config.json');

// Gmail related stuff are stored in this class.
const googleAuth = require('./login/google_auth');

// Active Directory user account related stuff are stored in this class.
const userAuth = require('./login/user_auth');

// Token related functions and middlewares are stored here.
const jwtFunctions = require('./jwt_functions');


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Listening for requests on the host and the port that is declared in config.json file.
app.listen(config['server-config'].port, config['server-config'].hostName, ()=>{

  console.log(`Server is running at ${config['server-config'].hostName}:${config['server-config'].port}`);

})

// Base path of API that shows the server is running.
app.get('/',(req, res)=>{

  res.send('<h2 style="text-align:center;margin:calc(50vh - 80px) 30px 0 30px;padding: 60px 20px;border-top:1px solid gray; border-bottom:1px solid gray">Auth Server is running ...</h2>')

})

// API end point for logging in with Gmail account.
// Request body parameters:
//    token: The access token that google API gives after a successful Gmail login.
app.post('/login/google', (req, res) => {

  let gLogin = new googleAuth(req.body.token);
  gLogin.login().then((result) => {

    res.status(result.code)
    if (result.code == 200)
      res.send({
        accessToken: jwtFunctions.generateToken(result.data),
        refreshToken: jwtFunctions.generateRefresh(result.data)
      })
    else
      res.send(result.data)

  })

})

// API end point for logging in with username and password.
// Request body parameters:
//    username: Active Directory username,
//    password: Active Directory password
app.post('/login/user-auth', (req, res) => {
  let userLogin = new userAuth(req.body.username, req.body.password);
  userLogin.login().then((result) => {

    res.status(result.code)
    if (result.code == 200)
      {
        
        res.send({
          accessToken: jwtFunctions.generateToken(result.data),
          refreshToken: jwtFunctions.generateRefresh(result.data)
        })

      }
    else
      res.send(result.data)

  })

})

// API end point for getting user info (that is stored in access token payload).
// Request header parameters:
//    Authorization: "Bearer access-token"
app.get('/get-info', jwtFunctions.authenticateToken, (req, res) => {
  res.status(200)
  res.send(req.payload)
})

// API end point for linking Gmail with user account.
// Request header parameters:
//    Authorization: "Bearer refresh-token"
// Request body parameters:
//    token: The access token that google API gives after a successful Gmail login.
// Becase the linked Gmail sub is stored in the payload of access and refresh tokens,
// after linking Gmail, we need to update the payload and also generate new refresh and access tokens,
// therefor in this case refresh token is used for authorization instead of access token.
app.post('/link-gmail', jwtFunctions.authenticateRefresh, (req, res) => {

  let gAuth = new googleAuth(req.body.token);
  gAuth.linkGmail(req.payload.id).then((result) => {

    if( result.code == 200) {

      // Removing the old refresh token and generating a new one with updated payload.
      jwtFunctions.removeRefresh(req.headers['authorization'].split(' ')[1])

      delete req.payload["iat"]
      delete req.payload["exp"]
      req.payload.gmail = result.gmail_id

      res.status(result.code)
      res.send({
        accessToken: jwtFunctions.generateToken(req.payload),
        refreshToken: jwtFunctions.generateRefresh(req.payload),
        message: result.message
      })
  
    }
    else{

      res.status(result.code)
      res.send(result.message)

    }

  })
  
})

// API end point for unlinking Gmail from user account.
// Request header parameters:
//    Authorization: "Bearer refresh-token"
// as described in the Gmail linking end point, the refresh token will be used for authorization here as well.
app.get('/unlink-gmail', jwtFunctions.authenticateRefresh, (req, res) => {

  let gLogin = new googleAuth();

  gLogin.unlinkGmail(req.payload.id, req.payload.gmail).then((result) => {

      if( result.code == 200) {

        // Removing the old refresh token and generating a new one with updated payload.
        jwtFunctions.removeRefresh(req.headers['authorization'].split(' ')[1])

        delete req.payload["iat"]
        delete req.payload["exp"]
        req.payload.gmail = null
        
        res.status(result.code)
        res.send({
          accessToken: jwtFunctions.generateToken(req.payload),
          refreshToken: jwtFunctions.generateRefresh(req.payload),
          message: result.message
        })
        
      }
      else {

        res.status(result.code)
        res.send(result.message)

      }
  })

})

// API end point for getting new access token with use of refresh token.
// Request header parameters:
//    Authorization: "Bearer refresh-token"
app.get('/get-new-token', jwtFunctions.authenticateRefresh, (req, res) => {

  // After the access token is validated by authenticateRefresh middleware, the payload of token is placed in req parameter.
  // The payload will include expiration data, so we need to get rid of them and generate a new access token with the that payload.
  // Note that if we don't delete expiration data, the generated token will be the same as the old one.
  delete req.payload["iat"]
  delete req.payload["exp"]
  
  res.status(200)
  res.send({
    accessToken: jwtFunctions.generateToken(req.payload)
  })

})

// API end point for logging out (removing refresh token from the database)
// Request header parameters:
//    Authorization: "Bearer refresh-token"
app.get('/logOut', (req, res) => {

  jwtFunctions.removeRefresh(req.headers['authorization'].split(' ')[1])
  res.sendStatus(200)

})
