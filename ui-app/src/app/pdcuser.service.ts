import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Md5 } from 'ts-md5/dist/md5';
import { ChorusUserUpdateResponse, ChorusUser, ChorusLabResponse, ChorusLab, PDCUserCreateResponse, PDCUserData, LoginUserResponse } from './types';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

//@@@PDC-477 - add organization field to registration form
//@@@PDC-873 - redirect user to PDC Portal main page after email confirmation
//@@@PDC-885 - fix registration bugs
//@@@PDC-919 - Lock user account after 6 unsuccessful login attempts
//@@@PDC-966 - implement reset password part of forgot password feature

//Service that uses pdcapi to manage users - create and check if the user is registered
@Injectable()
export class PDCUserService {

  password = 'PDCus3r6'; // Dummy password to use for all chorus users
  isLoggedIn = new BehaviorSubject<boolean>(false); //This variable is observable so that components can subscribe to it
  private userData: any;
  private uid: string = "";
  private loginAttempts = 1;

  constructor(private http: HttpClient) { 
	this.userData = {
		user_id: {
			type: '',
			data: []
		},
		login_username: '',
		email: '',
		user_id_type: '',
		name: '',
		organization: '',
		user_type: '',
		last_login_date: '',
		create_date: '',
		registered: 0,
		password: '',
    };
  }
  
  public setLoginUsername(email:string){
	  this.userData.login_username = email;
  }

  //PDC-421 New email field was added
  public setEmail(email: string){
	  this.userData.email = email;
  }
  
  public setName(name:string){
	  this.userData.name = name;
  }
  
  public setUserIDType(userid_type: string){
	  this.userData.user_id_type = userid_type;
  }
  
  public setUserType(user_type: string){
	  this.userData.user_type = user_type;
  }
  
  public setOrganization(organization:string){
	  this.userData.organization = organization;
  }
  
  public setUID(uid: string){
	  this.uid = uid;
	  console.log(this.uid);
  }
  
  public setLoginAttempt(attempts: number) {
	  this.loginAttempts = attempts;
  }
  public setIsLoggedIn(isLoggedIn: boolean){
	  this.isLoggedIn.next(isLoggedIn);
  }

   public isUserLoggedIn(): boolean {
    return this.isLoggedIn.getValue();
  }
  
  public getLoginAttempts():number {
	  return this.loginAttempts;
  }
  
  public getEmail():string{
	  return this.userData.email;
  }
  
  public getUserName(): string{
	  return this.userData.name;
  }
  
  public getOrganization(): string{
	  return this.userData.organization;
  }
  
  public getUserIDType(): string {
	  return this.userData.user_id_type;
  }
  
  public getUID(): string {
	  return this.uid;
  }
  
  public getIsRegistered(): number {
	  return this.userData.registered;
  }
  
  public getUserType(): string {
	  return this.userData.user_type;
  }
  
  public getLoginUsername(): string {
	  return this.userData.login_username;
  }
  // Checks to see if the user with this uid exists already in our DB
  // Since it is calling an asynchronous function it returns an observable so the caller can wait
  // checkPDCUser checks whether the user identified by uid is registered in PDC and if yes, the user is set to logged in
  // parameter: uid
  // return value: number
  //@@@PDC-419 handle system error		
  public checkPDCUser(uid: string): Observable<number> {
	const url = environment.private_api_url + 'uid/' + uid;
    let response: LoginUserResponse;

    this.setUID(uid);

    // @@@PDC-633: Need to make calls to pdcapi more secure.
    // Get a JWT from PDC API by a post call and use the token as authorization header while making the GET request.
    this.getJWTTokenFromPDCAPI();

    const existsObservable = new Observable<number>((observer) => {
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
          response = data as LoginUserResponse;
			if (response.data.length > 0){
				//if the user record is found
				this.userData = response.data[0];
				console.log(this.userData);
				if (this.userData.registered == 1) {
				  //if user's registered flag is set to 1, such user already exists, 
				  //thus loggedIn is set to true and 0 is returned
				  this.setIsLoggedIn(true);
				  this.setUserInformationInLocalStorage();
				  observer.next(0);
				} else {
				  //if user's registered flag is not set 1 is returned
				  observer.next(1);
				}
			} else {
			  //if user record not found 1 is returned
			  observer.next(1);
			}
			observer.complete();
        },
        (error: HttpErrorResponse) => {
			console.log(this.userData);
            console.log(error);
        //if there's a system error 2 is returned
            observer.next(2);
            observer.complete();
          });
      }, 1000);
    });

    return existsObservable;
  }

  // Checks to see if the user with this email exists already in our DB
  // checkPDCUserByEmail checks whether the user identified by email is registered in PDC and if yes, the user is set to logged in
  // parameter: email
  // return value: number
  //@@@PDC-419 handle system error		
  public async checkPDCUserByEmail(email: string, userPass:string = ''): Promise<number> {
    const url = environment.private_api_url + email;
    console.log("PDC API: " + url);
    let response: LoginUserResponse;

    // @@@PDC-633: Need to make calls to pdcapi more secure.
    // Get a JWT from PDC API by a post call and use the token as authorization header while making the GET request.
    let jwtTokenResponse;
    let data;
    let result = 2;
    try {
      jwtTokenResponse = await this.http.post(environment.pdcapi_jwt_url, null).toPromise();
      try {
        data = await this.http.get(url, { headers: new HttpHeaders({ 'authorization': 'bearer ' + jwtTokenResponse['token'] }) }).toPromise();
        response = data as LoginUserResponse;
        if (response.data.length > 0) {
          //if the user record is found 0 is returned
          this.userData = response.data[0];
          console.log(this.userData);
		  this.setLoginAttempt(this.userData.registered);
		  if (this.userData.user_id_type === "PDC") {
			  if (this.userData.registered > 0) {
				  if (Md5.hashAsciiStr(userPass) == this.userData.password) {
					this.setIsLoggedIn(true);
					result = 0;
					this.setUserInformationInLocalStorage();
					//If user tried to enter wrong password before, but now got their password right
					// need to reinitialize unsuccessful login attempts counter
					if (this.getIsRegistered() > 1) {
						this.successfulPDCUserLogin();
					}
				  } else {
					  //Wrong password
					  result = 4;
					  this.updateWrongPasswordCounter(email).subscribe(attempts => {
						console.log("Attempts: " + attempts);
						this.setLoginAttempt(attempts);
					  });
				  }
			  }
			  else if (this.userData.registered === 0){
				  //User registered through email/password and have not confirmed email yet.
				  result = 3;
			  } else {
				  console.log("Registered: " + this.userData.registered);
				  //User tried to login more than 6 times with wrong password and was blocked 
				  result = 7;
			  }
		  } else {
			   if (this.userData.registered === 1) {
				this.setIsLoggedIn(true);
				result = 0;
				this.setUserInformationInLocalStorage();
			   } else {
				   //user canceled their account
				   result = 5;
			   }
		  }
		  		   console.log(this.getUID());
        } else {
          //if the user record is not found 1 is returned
          result = 1;
        }
      } catch (error) {
        console.log(this.userData);
        console.log(error);
        //if there's a system error 2 is returned
        result = 2;
      }
    } catch (error) {
      console.log("Error in fetching token from PDCAPI");
    }
    return result;
  }
  
 private updateWrongPasswordCounter(userEmail: string): Observable<number> {
	const url = environment.private_api_url + "wrongpassword/" + userEmail;
	console.log(url);
	
    const user_data = {
		'email': userEmail
    };
	this.getJWTTokenFromPDCAPI();
	const registerObservable = new Observable<number>((observer) => {
		setTimeout(() => {
		  this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
				console.log(data);
				observer.next((data as any).attempts);
				observer.complete();
			},
			(error: HttpErrorResponse) => {
				console.log(error);
				observer.next(-1);
				observer.complete();
			});
		}, 1000);
	});
	return registerObservable;
	
 }
 
 private successfulPDCUserLogin(){
	const url = environment.private_api_url + "successlogin/" + this.getLoginUsername();
	console.log(url);
	
    const user_data = {
		'email': this.getLoginUsername()
    };
	setTimeout(() => {
		this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
				console.log(data);
				this.userData.registered = 1;	
				this.setLoginAttempt(this.userData.registered);
			},
			(error: HttpErrorResponse) => {
				console.log(error);
			});
		}, 1000);
 }

 // @@@PDC-633: Need to make calls to pdcapi more secure.
 // Makes a POST request to login service in PDCAPI to get a JWT. This valid token is used as an 
 // authorization header for making secure calls to PDCAPI apis.
 private getJWTTokenFromPDCAPI() {
    this.http.post(environment.pdcapi_jwt_url, null).subscribe(data => {
        localStorage.setItem('jwtToken', data['token']);
      },
      (error: HttpErrorResponse) => {
        console.log("Error in fetching token from PDCAPI");
      });
  }
  
  // Creates a new user using pdcapi PUT option with UID (NIH/eRA login credentials)
  //PDC-421 - added "username" parameter and "name" field to send to pdcapi
  public createPDCUser(uid: string, email: string, usertype:string, id_provider: string, username: string, organization: string): Observable<boolean> {
	const url = environment.private_api_url + this.uid;
	console.log("parameter uid: " + uid + " this.uid: " + this.uid + " url: " + url);
    // Create the user 
    const user_data = {
      'email': email,
      'user_id_type': id_provider,
      'user_type': usertype,
	  'name': username,
	  'organization': organization,
    };
  
  // @@@PDC-633: Need to make calls to pdcapi more secure.
  // Get a JWT from PDC API by a post call and use the token as authorization header while making the GET request.
  this.getJWTTokenFromPDCAPI();

	const registerObservable = new Observable<boolean>((observer) => {
    setTimeout(() => {
      this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
        console.log(data);
        // Now since the user is created lets update it
        this.setLoginUsername(email);
        this.setIsLoggedIn(true);
        this.setUserInformationInLocalStorage();
        observer.next(true);
        observer.complete();
        },
        (error: HttpErrorResponse) => {
        console.log(error);
        observer.next(false);
              observer.complete();
        });
    }, 1000);
	});
	return registerObservable;
  }
  
  // Creates a new user using pdcapi POST option with name and email(google login credentials)
   public createPDCUserByEmail(firstname: string, lastname: string, email: string, usertype: string, id_provider: string, organization: string, userpass:string=''): Observable<boolean> {
	const url = environment.private_api_url;
	console.log(url);
    // Create the user 
	const username = firstname + ' ' + lastname;
    const user_data = {
	  'login_username': email,
	  'name': username,
      'email': email,
      'id_provider': id_provider,
      'user_type': usertype,
	  'organization': organization,
	  'password': userpass,
    };
	
    // @@@PDC-633: Need to make calls to pdcapi more secure.
	// Get a JWT from PDC API by a post call and use the token as authorization header while making the GET request.
	this.getJWTTokenFromPDCAPI();
	
	const registerObservable = new Observable<boolean>((observer) => {
	  //PDC-824 when allowing login with just email address and password and the password is empty do not proceed to registration
	  if (id_provider === 'PDC' && userpass === ''){
			console.log("Password is empty for PDC user!");
			observer.next(false);
			observer.complete();
	  } else {
		setTimeout(() => {
		  this.http.post(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe((response: any) => {
			//when user is created successfully we set him to be logged in
			//unless they registered with their email/password and have not confirmed the email yet
			let userData = response.data;
			if (userData.user_id_type != 'PDC' || userData.registered != 0 ){
				this.setEmail(email);
				this.setName(username);
				this.setUserIDType(id_provider);
				this.setUserType(usertype);
				this.setOrganization(organization);
				this.setLoginUsername(email);
				this.setIsLoggedIn(true);
				this.setUserInformationInLocalStorage();
				console.log("Loggin user in!");
			}
			console.log(response);
			observer.next(true);
			observer.complete();
		  },
		  (error: HttpErrorResponse) => {
			console.log(error);
			observer.next(false);
				  observer.complete();
		  });
		}, 1000);
	  }
	});
	return registerObservable;
  }
  
  //@@@PDC-928 - implement user forgot password
  public userForgotPassword(email: string): Observable<boolean>{
	const url = environment.private_api_url + "forgot-password/";
	const user_data = {
		'email': email
	};
	this.getJWTTokenFromPDCAPI();
	const registerObservable = new Observable<boolean>((observer) => {
	  setTimeout(() => {
		this.http.post(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe((response: any) => {
			console.log('Password reset email was successfully sent');
			observer.next(true);
			observer.complete();
		},
        (error: HttpErrorResponse) => {
			console.log(error);
		observer.next(false);
              observer.complete();
        });
      }, 1000);
	});
	return registerObservable;	
  }
  
  
  public updateUserData(firstname: string, lastname: string, email: string, usertype: string, id_provider: string, organization: string, userpass:string=''): Observable<boolean> {
	const url = environment.private_api_url + "update/" + this.getLoginUsername();
	console.log(url);
	const username = firstname + ' ' + lastname;
    const user_data = {
	    'email': email,
		'user_type': usertype,
		'name': username,
		'organization': organization,
    };
	this.getJWTTokenFromPDCAPI();
	const registerObservable = new Observable<boolean>((observer) => {
    setTimeout(() => {
      this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
        console.log(data);
        // Now since the user is created lets update it
        this.setLoginUsername(email);
        this.setIsLoggedIn(true);
        this.setUserInformationInLocalStorage();
        observer.next(true);
        observer.complete();
        },
        (error: HttpErrorResponse) => {
        console.log(error);
        observer.next(false);
              observer.complete();
        });
    }, 1000);
	});
	return registerObservable;
	
  }
  
  public cancelUser(username: string, email: string, usertype: string, id_provider: string, organization: string, userpass:string=''): Observable<boolean> {
	const url = environment.private_api_url + "cancel/" + this.getLoginUsername();
	console.log(url);
	
    const user_data = {
		'email': email,
		'user_type': usertype,
		'name': username,
		'organization': organization,
    };
	this.getJWTTokenFromPDCAPI();
	const registerObservable = new Observable<boolean>((observer) => {
    setTimeout(() => {
      this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
        console.log(data);
        // Cancelling account was successful, log out the user
        this.logout();
        observer.next(true);
        observer.complete();
        },
        (error: HttpErrorResponse) => {
        console.log(error);
        observer.next(false);
              observer.complete();
        });
    }, 1000);
	});
	return registerObservable;
	
  }
  
  public updatePassword(uid: string, userpass:string=''): Observable<boolean> {
	this.logout(); //make sure the user is logged out before changing the password  
	const url = environment.private_api_url + "update-pass/" + uid;
	console.log(url);
	
    const user_data = {
		'pass': userpass
    };
	this.getJWTTokenFromPDCAPI();
	const registerObservable = new Observable<boolean>((observer) => {
    setTimeout(() => {
      this.http.put(url, user_data, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
			console.log(data);
			observer.next(true);
			observer.complete();
        },
        (error: HttpErrorResponse) => {
			console.log(error);
			observer.next(false);
            observer.complete();
        });
    }, 1000);
	});
	return registerObservable;
	
  }
  
  //@@@PDC-873 - redirect user to PDC Portal main page after email confirmation
  public confirmUserEmail(email:string): Observable<number> {
	const url = '/pdcapi/confirm/' + email;
    let response: LoginUserResponse;

    // @@@PDC-633: Need to make calls to pdcapi more secure.
    // Get a JWT from PDC API by a post call and use the token as authorization header while making the GET request.
    this.getJWTTokenFromPDCAPI();

    const confirmObservable = new Observable<number>((observer) => {
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
          response = data as LoginUserResponse;
			if (response.data.length > 0){
				//if the user record is found
				this.userData = response.data[0];
				console.log(this.userData);
				if (this.userData.registered == 1) {
				  //if user's registered flag is set to 1, such user already exists, 
				  //thus loggedIn is set to true and 0 is returned
				  this.setIsLoggedIn(true);
				  this.setUserInformationInLocalStorage();
				  observer.next(0);
				} else {
				  //if user's registered flag is not set 1 is returned
				  observer.next(1);
				}
			} else {
			  //if user record not found 1 is returned
			  observer.next(1);
			}
			observer.complete();
        },
        (error: HttpErrorResponse) => {
			console.log(this.userData);
            console.log(error);
        //if there's a system error 2 is returned
            observer.next(2);
            observer.complete();
          });
      }, 1000);
    });

    return confirmObservable;	  
  }
  
  //Logging user out of the system
  public logout(){
	  console.log("Logging out user " + this.getUserName());
	  this.isLoggedIn.next(false);
	  this.setLoginUsername("");
	  this.setName("");
	  this.setUID("");
    this.setOrganization("");
    this.setIsLoggedIn(false);
    //@@@PDC 709: User remains logged in forever if their session does not time out before they close the browser
    //Trigger storage event for retaining session across multiple tabs
    localStorage.setItem('logout', 'true');
    localStorage.removeItem('logout');
    sessionStorage.clear();
  }

  // Set information in session storage for retaining authentication.
  private setUserInformationInLocalStorage() {
    //@@@PDC 709: User remains logged in forever if their session does not time out before they close the browser
    sessionStorage.setItem("loginToken", "true");
    sessionStorage.setItem("loginUser", this.getUserName());
    sessionStorage.setItem("loginEmail", this.getEmail());
  }
  
}
