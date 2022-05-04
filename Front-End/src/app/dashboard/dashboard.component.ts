import { Component, OnInit } from '@angular/core';
import axios from 'axios';

// Service for Gmail related functions:
import { GoogleLoginService } from './../google-login.service';

// Import data of json.config file
import serverConfig from '../../config.json';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  name = null;
  roles = null;
  gmail = null;

  linkMessage: string;
  linkStat: string;

  constructor(private glogInService: GoogleLoginService) { }

  ngOnInit(): void {
    
    // Check if access and refresh token exists:
    if (localStorage.getItem('accessToken') && localStorage.getItem('refreshToken')) {

        // Get user data:
        axios.get(`${ serverConfig['API-base-address'] }get-info`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }).then((res) => {

          // If the access token is valid, then we'll get user data:
          this.name = res.data.name
          this.roles = res.data.roles[0] ? res.data.roles : null
          this.gmail = res.data.gmail

        }).catch((err) => {

          // If the access token is not valid (more likely expired), we'll try to get a new access token with use of refresh token:
          axios.get(`${ serverConfig['API-base-address'] }get-new-token`,{
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
            }
          }).then((res) => {

            // Update the access token stored in local storage:
            localStorage.setItem('accessToken', res.data.accessToken)
            location.reload()

          }).catch((err) => {

            // If the refresh token is invalid, remove access and refresh token from local storage and return to login page:
            if(localStorage.getItem('accessToken'))
                localStorage.removeItem('accessToken')
            if(localStorage.getItem('refreshToken'))
              localStorage.removeItem('refreshToken')
              
              window.location.href = '../'

          })
        })
      }
    else {

      // If one or both of access and refresh tokens does not exist, clear the local storage and remove refresh token from database (if existed) and return to login page:
      this.logOut();
      
    }

  }

  // Function for logging out.
  logOut(): void {

    // Call logout API:
    axios.get(`${ serverConfig['API-base-address'] }logOut`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
          }
        }).then(() => {

          // Clear local storage and return to login page
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          window.location.href = '../'

        })

  }

  // Function for linking Gmail with user account.
  linkGmail() {

    this.linkMessage = "";
    this.glogInService.linkGmail().then((res: any) => {
      
      if(res.code == 200) {

        // If the linking process is successful, the access and refresh tokens will get updated and the page will reload:
        this.linkStat = 'green'
        this.linkMessage= res.data.message
        localStorage.setItem('accessToken', res.data.accessToken)
        localStorage.setItem('refreshToken', res.data.refreshToken)
        window.location.reload()

      }
      else{

          this.linkStat = 'red'
          this.linkMessage = res.data

      }

    })
  }

  // Function for unlinking Gmail from user account.
  unLinkGmail() {

    this.linkMessage = "";

    // Call Gmail unlinking API:
    axios.get(`${ serverConfig['API-base-address'] }unlink-gmail`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('refreshToken')}`
      }
    }).then((res) => {

      // If successful, update refresh and access tokens and reload the page:
      this.linkStat = 'green'
      this.linkMessage = res.data.message
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      window.location.reload()

    }).catch((err) => {

      // If not successful, show the error message:
      this.linkStat = 'red'
      this.linkMessage = err.response.data
      if (err.status != 500) {
        this.logOut();
      }
    })
  }

}
