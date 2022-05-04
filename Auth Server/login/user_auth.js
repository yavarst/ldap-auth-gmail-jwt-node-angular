// This class is for authenticating with username and password.


const ldap = require('ldapjs');

// The whole configuration of Auth server is stored here.
const config = require('../config.json');

// Database related functions are stored here.
const dbFunctions = require('../db_functions')


class userAuth {

    username;
    password;
    currentUser;

    constructor(username, password, currentUser = null) {
      this.username = username
      this.password = password

      // Need to explain this part of the userAuth class:
      // When the user logs in with the username and password, we do a regular user authentication and the current user is the given username;
      // But when the user logs in with the Gmail account, then we no more have a username and password in hand,
      // and therefore we cannot access Active Directory (or in technical terms bind a client);
      // So in this case a valid username and password is bin provided in config.json file to bind LDAP client (and access AD),
      // and in this case the current user will be the user that matches with the Gmail in the database.
      if (!currentUser || currentUser == null || currentUser == "") this.currentUser = username
      else this.currentUser = currentUser
    }

    // Login function with username & password
    login() {
      return new Promise((resolve, reject) => {

        // Check if the username carries a domain name:
        if ( this.username.split('@')[1] ) {

          // Check if the domain name of username is the same as allowed domain in the config file:
          if(this.username.split('@')[1] === config['ldap-config'].allowedDomain) {
            
            // Search Active Directory for user that matches the given username and password,
            // and also get groups of the user if the username and password is correct.
            this.searchUser().then((res) => {

              if(res.code == 200) {

                // We what to know if the user is an admin or not,
                // therefor filtering groups (of the user) that contain "admin" word:
                let groups = [];
                for(let i=0; i< res.data.groups.length;i++){
                  if(res.data.groups[i].cn.toLowerCase().includes("admin")){
                      groups.push(res.data.groups[i].cn.slice(0, -1))
                  }
                }
                
                // Search the database to see if a Gmail account is linked with this user:
                dbFunctions.executeQuery(`SELECT \`gmail_id\` from \`gmail\` where ad_id='${ this.username }'`)
                .then((rows) => {

                  // And in the end return the collected data:
                  resolve({
                    code: 200,
                    data: {
                        id: this.currentUser,
                        name: res.data.user.cn,
                        gmail: rows[0] ? rows[0].gmail_id : null,
                        roles: groups
                    }
                  })

                }).catch((err) => {

                  resolve({
                    code: 500,
                    data: err
                  })

                })

              }
              else {

                resolve(res)
                
              }
              
            })
            
          }
          else {

              resolve({
                code: 403,
                data: 'The entered domain is not allowed for logging in!'
              })

          }
      }
      else {

          resolve({
            code: 403,
            data: 'Invalid username!'
          })

      }

      })
      
    }

    // This function is for searching Active Direcotry user (authenticating) and also retrieving the groups that the user is a member of them.
    searchUser() {

      return new Promise((resolve, reject) => {

        // Creating LDAP client:
        let client = ldap.createClient({

          url: config['ldap-config'].url

      });

      client.on('error', (err) => {

          resolve({
            code: 500,
            data: err
          })
          
      })
      
      // See if the username and password match:
      client.bind(this.username, this.password, (err) => {

          if (err) {
              
              resolve({
                code: 403,
                data: 'Username and password don\'t match!'
              })

          }
          else {

            console.log("Log on successful!");

            // This part is for getting "Distinguished Name" and "Common Name" of the user;
            // Common name or "cn" will be displayed in the front-end part of the project,
            // and the Distinguished Name or "dn" will be used to get the groups that the user is member of them.
            client.search(config['ldap-config'].suffix, {

              filter: `(userPrincipalName=${ this.currentUser })`,
              scope: 'sub',
              attributes: ['dn', 'cn']
    
              }, (err, res) => {

                if(err) console.log('Error: ' + err.message)
              
                // In this project we don't need to do anything when searchRequest occures, so we can pass the following line of code:
                // res.on('searchRequest', (searchRequest) => { });

                res.on('searchEntry', (entry) => {
    
                  let groups = [];
    
                  // Search for groups that has a member matching Distinguished Name of the current user:
                  client.search(config['ldap-config'].suffix, {
    
                    filter: `(&(objectClass=group)(member=${entry.object.dn}))`,
                    scope: 'sub',
                    attributes: ['dn', 'cn']
                      
                  }, (err, res) => {

                    if(err) console.log('Error: ' + err.message)
    
                    // As the prior one ...
                    // res.on('searchRequest', (searchRequest) => { });

                    res.on('searchEntry', (entry2) => {

                      groups.push(entry2.object)
  
                    });
                    res.on('error', (err) => {
                      
                      reject(err)

                    });
                    res.on('end', (result) => {
                      
                      // Return the user info and groups:
                      resolve({
                        code: 200,
                        data: {
                          user: entry.object,
                          groups: groups
                        }
                      })

                    });
                      
                  })

                });
                res.on('error', (err) => {

                  reject(err)

                });

              });

          }

      });

      client.unbind((err) => { if(err) console.log('Error unbinding client: ' + err.message) });

    })

  }

}

module.exports = userAuth;