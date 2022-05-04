// This class for authenticating with Gmail account.

const { OAuth2Client } = require('google-auth-library');

// Active Directory user account related stuff are stored in this class.
const userAuth = require('./user_auth');

// Database related functions are stored here.
const dbFunctions = require('../db_functions');

// The whole configuration of Auth server is stored here.
const config = require('../config.json');


class googleAuth {

    client
    idToken

    constructor(idToken = null) {
        this.idToken = idToken
        
        this.client = idToken ? new OAuth2Client(config['google-client-id']) : null
    }

    // Function for verifying and getting payload of the google token.
    async verify() {
        try{
            const ticket = await this.client.verifyIdToken({
                idToken: this.idToken,
                audience: config['google-client-id']
                })
                return ticket.getPayload();
        }
        catch {
            return null
        }
    }

    // Function for loging in with Gmail account.
    login() {

        return new Promise((resolve, reject) => {

            // First need to validate google idToken:
            this.verify().then((payload) => {

                // If the idToken is valid, so there will be a payload:
                if(payload !== null) {
                    
                    // Check if the Gmail sub exists in database:
                    dbFunctions.executeQuery(`SELECT \`ad_id\` from \`gmail\` where gmail_id='${ payload['sub'] }'`).then((rows) => {

                        if(rows.length > 0) {
    
                            let userLogin = new userAuth(config['ldap-config'].username, config['ldap-config'].password, rows[0].ad_id)
                            
                            userLogin.searchUser().then((result) => {
    
                                // We what to know if the user is an admin or not,
                                // therefor filtering groups (of the user) that contain "admin" word:
                                let groups = [];
                                for(let i=0; i< result.data.groups.length;i++){
                                    if(result.data.groups[i].cn.toLowerCase().includes("admin")){
                                        groups.push(result.data.groups[i].cn.slice(0, -1))
                                    }
                                }

                                resolve({
                                    code: 200,
                                    data: {
                                        id: rows[0].ad_id,
                                        name: result.data.user.cn,
                                        gmail: payload['sub'],
                                        roles: groups
                                    }
                                })
    
                            })
    
                        }
                        else {
                            resolve({
                                code: 404,
                                data: 'No account is linked to this Gmail!'
                            })
                        }

                    }).catch((err) => {

                        resolve({
                            code: 500,
                            data: err
                        })

                    })
                    
                }
                else {
                    resolve({
                        code: 403,
                        data: 'Invalid token!'
                    })
                }
    
            })

        })

    }

    // Function for linking Gmail account to AD user.
    linkGmail(user_id) {

        return new Promise((resolve, reject) => {

            // First need to validate google idToken:
            this.verify().then((payload) => {

                // If the idToken is valid, so there will be a payload:
                if(payload !== null) {

                    // Check the database to see if the user account has a gmail linked to it:
                    dbFunctions.executeQuery(`SELECT \`gmail_id\` FROM \`gmail\` WHERE ad_id= '${ user_id }'`)
                    .then((rows) => {

                        if(rows[0]){

                            resolve({
                                code: 403,
                                message: 'This user account has a Gmail linked to it!'
                            })

                        }
                        else {

                            // Check the database to see if the Gmail account is linked with another user account before:
                            dbFunctions.executeQuery(`SELECT \`ad_id\` FROM \`gmail\` WHERE  gmail_id='${ payload.sub }'`)
                            .then((rows_2) => {
        
                                if(rows_2[0]){
        
                                    resolve({
                                        code: 403,
                                        message: 'This Gmail is linked with another account!'
                                    })
        
                                }
                                else {
        
                                    // If the user account has no Gmail linked to it and also the Gmail isn't linked to another account,
                                    // then we can insert the corresponding data into database:
                                    dbFunctions.executeQuery(`INSERT INTO \`gmail\` VALUES('${ user_id }', '${ payload.sub }')`).then(() => {
        
                                        resolve({
                                            code: 200,
                                            message: 'Gmail linked successfully!',
                                            gmail_id: payload.sub
                                        })
        
                                    }).catch((err) => {
        
                                        resolve({
                                            code: 500,
                                            message: err
                                        })
        
                                    })
        
                                }
        
                            }).catch((err) => {
        
                                resolve({
                                    code: 500,
                                    message: err
                                })
                                
                            })

                        }

                    }).catch((err) => {

                        resolve({
                            code: 500,
                            message: err
                        })

                    })

                    

                }
                else {

                    resolve({
                        code: 403,
                        data: 'Invalid token!'
                    })

                }
                

            })

        })
    }

    // Function for unlinking Gmail account from AD user.
    unlinkGmail(user_id, gmail_id) {
        
        return new Promise((resolve, reject) => {

            dbFunctions.executeQuery(`DELETE FROM \`gmail\` where gmail_id='${ gmail_id }' and ad_id='${ user_id }'`)
            .then((rows) => {

                resolve({
                    code: 200,
                    message: 'Gmail unlinked successfully!'
                })

            }).catch((err) => {

                resolve({
                    code: 500,
                    message: 'An error occured at server side, please try again later!'
                })

            })

        })

    }

}

module.exports = googleAuth