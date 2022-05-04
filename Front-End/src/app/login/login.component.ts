import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

// Service for user account related functions:
import { UserLoginService } from './../user-login.service';

// Service for Gmail related functions:
import { GoogleLoginService } from './../google-login.service';

// Import data of json.config file
import serverConfig from '../../config.json';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // Put the name of the domain you want to allow users to login with in this variable:
  allowedDomain: string = serverConfig.allowedDomain;
  user: any;
  username:string;
  password: string;
  loginMessage: string;
  loginStat: string;

  constructor(private glogInService: GoogleLoginService, private uLoginService: UserLoginService, private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    // When login component gets initialized, it'll check to see if the access and refresh token exists in local storage,
    // if exists, then will redirect to the dashboard page:
    if (localStorage.getItem('accessToken') && localStorage.getItem('refreshToken'))
      window.location.href = '/dashboard'
    else {

      // If one of the access or refresh token does not exist, then the other one will get deleted as well:
      if(localStorage.getItem('accessToken'))
          localStorage.removeItem('accessToken')
      if(localStorage.getItem('refreshToken'))
        localStorage.removeItem('refreshToken')
      
    }

    // No need to observe the user because the session does not depend on Gmail, so we can pass the following part of code:
    // this.glogInService.observable().subscribe( user => {
    //   this.user = user;
    //   this.ref.detectChanges();
    // })

  }

  // Function for logging in with Gmail account.
  gLogIn() {

    this.loginMessage = ""
    this.glogInService.logIn().then((res: any) => {
      
      this.finalizeLogin(res);

    })
  }

  // Function for logging in with username and password.
  userLogin(e: Event){
    e.preventDefault();
    this.loginMessage = ""
    this.uLoginService.logIn(`${this.username}@${this.allowedDomain}`, this.password).then((res: any) => {
      
      this.finalizeLogin(res);

    })
  }

  // Due to preventing code repetition, this function is for showing login result,
  // and also storing access and refresh token if the login process is successful.
  finalizeLogin(res: any) {

      if(res.code == 200) {

        this.loginStat = 'green'
        this.loginMessage= "Login successful! Redirecting..."

        // I know storing access and refresh token in local storage is not the best practice,
        // but for the scope of this project it's enough.
        localStorage.setItem('accessToken', res.data.accessToken)
        localStorage.setItem('refreshToken', res.data.refreshToken)

        // Redirect to dashboard:
        window.location.href = '/dashboard';

      }
      else{
          this.loginStat = 'red'
          this.loginMessage = res.data
      }
  }

}

