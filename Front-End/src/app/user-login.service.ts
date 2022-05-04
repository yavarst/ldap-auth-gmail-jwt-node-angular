// This service is for logging in with username and password.


import { Injectable } from '@angular/core';
import axios from 'axios';

// Import data of json.config file
import serverConfig from '../config.json';


@Injectable({
  providedIn: 'root'
})
export class UserLoginService {
  
  constructor() {
  }

  // Function for logging in with username and password.
  logIn(username: string, password: string){

    return new Promise((resolve, reject) => {

      // Call API end point for user login:
      axios.post(`${ serverConfig['API-base-address'] }login/user-auth`,{
          username: username,
          password: password
        }).then((response) => {
          resolve({
            code: response.status,
            data: response.data
          })
        }).catch((error)=>{
          resolve({
            code: error.status,
            data: error.response.data
          })
        })

    })

  }

}
