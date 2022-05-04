# ldap-auth-project
Authentication and authorization with LDAP, Gmail and JWT.

This is a simple project demonstrating authentication and authorization with LDAP protocol, and also with the option of linking Gmail account to the Active Directory user.

The Back-End of project is developed with NodeJs(express) and MySQL, the Front-End is developed with Angular, and JWT is used for sessions.


### You will read:
- [Prerequisites of the project](https://github.com/yavarst/ldap-auth-project/edit/main/README.md#prerequisites-of-project)
- [Explaination of `config.json` file in `Auth Server`](https://github.com/yavarst/ldap-auth-project/edit/main/README.md#explaination-of-configjson-file-in-auth-server-folder)
- [Explaination of `config.json` file in `Front-End/src`](https://github.com/yavarst/ldap-auth-project/edit/main/README.md#explaination-of-configjson-file-in-front-endsrc-folder)
- [How to run the project](https://github.com/yavarst/ldap-auth-project/edit/main/README.md#how-to-run-the-project)

---

### Prerequisites of project

To be able to run the project, you need to first provide the prerequisites:

**Windows Server:**

You need to provide a ready-to-use windows server with configured Active Directory and LDAP.
After that, you need to enter the required data in `"ldap-config"` section of `config.json` file in `Auth Server` folder:

`"ldap-config": {`
- **`"url":`** <br>
you need to enter LDAP url of windows server. by default it'll be the same address as the windows server address, except that instead of **http** you need to enter **ldap**, like the example: `"LDAP://192.168.20.128/"`.
- **`"allowedDomain":`** <br>
The domain name that you want to allow users to log in with, that most likely will be your windows server domain. in my case it is `"jalali.local"`.
- **`"suffix":`** <br>
In simple words, it is the domain name of windows server in LDAP terms. in my case that the domain name is `"jalali.local"`, suffix will be `"DC=jalali,DC=local"`. <br> <br>

     *`The username and password required in this part will be used to access active directory when logging in with Gmail.
     Any valid Active Directory username and password will work.`*
- **`"username":`** for example `"yavar@jalali.local"`.
- **`"password":`** the password of the entered username.

`}`

Note that you also need to enter `"allowedDomain"` value in `config.json` file in `Front-End/src` folder as well.

<br><br>

**MySQL Server:**

A MySQL server is required as well to put our database on.<br>
You can install a free Windows open source web hosting control panel on your Windows server, or you can install XAMPP on your machine to have MySQL server.<br>
After providing a MySQL server, import the **sql file** located in project folder and execute it to generate database and its tables.<br>
Now that you have the database generated, you need to enter:

- Host name of MySQL server
- Database name
- MySQL Username
- MySQL Password

in the `"mysql-config"` section of `config.json` file in Auth Server folder.

<br><br>

**Installing NodeJs and Angular:**

You need to install **NodeJs** on the machine that you want to run the Auth Server (Back-End part of project).<br>
At the development time of project, Node version **16.14.2** is used. You can install any version that **hasn't major changes since the version 16.14.2**.<br>
Make sure to include Node in the **system Path environment variable** so that you can use Node commands in any directory in command-line.<br>
After installing NodeJs, You need to install **Angular CLI** as well. Angular CLI version **13.3.1** is used at the time of development.<br>
To install Angular CLI version 13.3.1, open command-line and run the command below:

	npm install @angular/cli@13.3.1

<br><br>

**Package dependencies:**

You need to install the packages required for both **Auth Server** and **Front-End** because the `node_modules` folder ***is not inclued*** in project resources.<br>
To install package dependencies, you simply need to open *command-line* and change the directory to sub project folders (Auth Server and Front-End) and run the command **`"npm install"`**. ***Make sure to do this for both Auth Server folder and Front-End folder.***

<br><br>

**Google authorization credential:**

You also need to create a google authorization credential for logging in with Gmail.<br>
To be able to create an authorization credential, you need to *create a project* or *use an old one* in **Google Developers Console**.

To create a Google Cloud project, open the [Google Cloud Console](https://console.cloud.google.com/),<br>
At the top-left, click **Menu > IAM & Admin > Create a Project**.

Now for creating an authorization credential, visit the [google console credentials page](https://console.cloud.google.com/apis/credentials),<br>
Click **Create credentials > OAuth client ID**.<br>
Select **Web application** as application type.<br>
Name your OAuth 2.0 client and click Create.

Remember that you need to enter **address of your Front-End server** in the **Authorised JavaScript origins** section. You can fill this part later when running the project.<br>
After creating the authorization credential, copy the **Client ID** and paste it in the `"google-client-id"` section of `config.json` files of both **Auth Server** and **Front-End** sub projects:

- `config.json` file in `Auth Server` folder
- `config.json` file in `Front-End/src` folder
		
<br><br>

Now that everything is done, you need to **fill remaining parts of config.json files** with the right data and after that the project is ready to go.

`config.json` file in the **Auth Server** folder:

`"server-config": {`  In this section you will define on which **host name** and **port number** the Auth Server will listen for requests.

- `"hostName":` The host name that the server will listen on. In most cases it will be `"localhost"` or `"127.0.0.1"`.
- `"port":` The port number that the server will listen on. I mostly use 3000.

`}`

<br>

`"jwt-config": {` In this section you'll enter the required data for generating **JWT tokens**.
- `"token_expire_time":` Life time or expiration time of access tokens. In my case it is `"20m"` that represents 20 minutes, that means after 20 minutes the access token will be invalid.<br>
You can use `s` for seconds, `m` for minutes, `h` for hours and so on.
- `"access_token_secret":` secret phrase for access token. It can be any string you want, just make sure that it's not something predictable.
- `"refresh_token_secret":` secret phrase for refresh token. Make sure that it's different than "access_token_secret".

`}`

<br>

And `config.json` file in the **Front-End/src** folder:

`"API-base-address":` The **base url** of the **Auth Server API address**. In my case it's `http://localhost:3000/`;<br>
Because I'm running both of the *Auth Server* and the *Front-End server* on the same machine, the **API-base-address** and **Auth Server address** are the same, but if you want to build the Front-End sub project and upload it on a web host, this address will be different.<br>
And also if we change the Auth Server's address, we can simply change value of this part and access the API.

---

### Explaination of `config.json file` in `Auth Server` folder

This file contains the whole configuration of the Auth Server:

```
"server-config": The host and port which the server will listen on.
	"hostName": The host that the server will listen on.
	"port": The port number that the server will listen on.

"mysql-config": Data needed for creating MySQL connection.
	"hostName": Host of MySQL server.
        "database": Database name.
        "username": MySQL user account name.
        "password": MySQL user account password.

"ldap-config": Configuration required for LDAP protocol.
        "url": LDAP url of windows server.
        "allowedDomain": The domain name that users are allowed to login with.
        "suffix": LDAP search base suffix (the Windows server's domain name in LDAP terms).
        
	The username and password below will be used to access active directory when logging in with Gmail.
	Any valid Active Directory username and password will work.
        "username": username
        "password": password

"jwt-config": Data required to generate JWT tokens.
        "token_expire_time": Expiration time of access token.
        "access_token_secret": secret phrase for access token.
        "refresh_token_secret": secret phrase for refresh token.

"google-client-id": Google authorization credential Client ID used for logging in with Gmail.
```

---

### Explaination of `config.json` file in `Front-End/src` folder

This file contains some data required for Front-End sub project:

```
"API-base-address": The base url of the Auth Server API address. In my case it is "http://localhost:3000/". Make sure to include a "/" at the end of the url.
	If we change the Auth Server address, we can simply change value of this part and access the API.

"allowedDomain": The domain name that you want to allow users to log in with. Same as the "allowedDomain" in config.json file of Auth Server.

"google-client-id": Google authorization credential Client ID used for logging in with Gmail.
```

---

### How to run the project

After providing prerequisites and filling config.json files with required data, you are ready to run the project.

First make sure that your **Windows Server** and **MySQl Server** are up and running.

To run the **Auth Server** (back-end sub project), open the command-line and change directory to **Auth Server folder**.<br>
You can use your text editor's terminal as well.
After changing directory to Auth Server folder, you can simply run the server by command below:

	node server.js

<br>

To run the **Front-End Angular server**, like you did in running the Auth Server, open the command-line and change directory to **Front-End folder**,
then execute the command below:

	ng serve

<br>

If you want to compile (build) the Front-End project and upload it to a web host, you can use this command instead:

	ng build <output path>

Remember to enter/update **Front-End server address** in the **Authorised JavaScript origins** section of Google authorization credential to be able to log in with Gmail.

<br>

Now that both Back-End and Front-End servers are running, you can open your browser and visit the login page:

- If you're running the Angular server on your machine, open your browser on http://localhost:4200/ (default port for Angular is 4200. You can check the **command-line message** and see the hostname and the port number that the server is listening on).
- If you've built the Front-End project and uploaded it on a web host, then you can simply visit the web host's address.<br>

---
