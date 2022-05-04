import { UserLoginService } from './user-login.service';
import { GoogleLoginService } from './google-login.service';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    routingComponents
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    GoogleLoginService,
    UserLoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
