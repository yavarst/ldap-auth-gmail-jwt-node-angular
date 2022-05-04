// This service is for logging in with Gmail account.


import { Injectable } from '@angular/core';
import axios from 'axios';
import { ReplaySubject, Observable } from 'rxjs';

// Import data of json.config file
import serverConfig from '../config.json';


@Injectable({
  providedIn: 'root'
})
export class GoogleLoginService {

  private subject = new ReplaySubject<gapi.auth2.GoogleUser>(1);
  private auth2: gapi.auth2.GoogleAuth;
  constructor() {
    gapi.load('auth2', ()=>{
      this.auth2 = gapi.auth2.init({
        client_id: serverConfig['google-client-id']
      })
    })
  }

  // Function for logging in with Gmail.
  logIn() {

    return new Promise((resolve, reject) => {

      this.auth2.signIn()
      .then( user => {
        this.subject.next(user);

        // If the google login part is successful, call the login with google API end point and pass the google id token:
        axios.post(`${ serverConfig['API-base-address'] }login/google`,{
          token: user.getAuthResponse().id_token
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

      }).catch( () => {
        this.subject = new ReplaySubject<gapi.auth2.GoogleUser>(1)
        resolve({
          code: 500,
          data: "Something went wrong! please try again later."
        })
        
      })
    })
  }

  // Function for linking Gmail with user account.
  linkGmail() {
    return new Promise((resolve, reject) => {
      this.auth2.signIn()
      .then( user => {
        this.subject.next(user);

        // If the google login part is successful, call the Gmail linking API end point and pass the google id token:
        axios.post(`${ serverConfig['API-base-address'] }link-gmail`,{
          token: user.getAuthResponse().id_token
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
          }
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

      }).catch( () => {
        this.subject = new ReplaySubject<gapi.auth2.GoogleUser>(1)
        resolve({
          code: 500,
          data: "Something went wrong! please try again later."
        })
        
      })
    })
  }

  
  // No need to logout Gmail user cause our session does not depend on it.
  // logOut() {
  //   this.auth2.signOut()
  //     .then( ()=> {
  //       this.subject = new ReplaySubject<gapi.auth2.GoogleUser>(1)
  //         // ...
  //     })
  // }

  // And also no need to observe the Gmail user.
  // observable() : Observable<gapi.auth2.GoogleUser> {
  //   return this.subject.asObservable()
  // }

}
