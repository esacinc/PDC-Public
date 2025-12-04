import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ChorusUserUpdateResponse, ChorusUser, ChorusLabResponse, ChorusLab } from './types';
import { Observable } from 'rxjs';
import { environment } from "../environments/environment";

@Injectable()
export class ChorusauthService {

  password = ''; // Dummy password to use for all chorus users

  constructor(private http: HttpClient) { }

  // Checks to see if the user with this email exists already in Chorus
  // Since it is calling an asynchronous function it returns an observable so the caller can wait
  public checkUser(email: string): Observable<boolean> {

    email = sessionStorage.getItem('loginUser');

    // @@@PDC-5894: NIH Federated Login creates a new username with user type id NIH which is not in WS table
    // Validate the username, if it's not email then get loginEmail
    if (!this.validateEmail(email)) {
      email = sessionStorage.getItem('loginEmail');
    }
	
	//@@@PDC-9083 check user only w/o lab
    const url = environment.chorus_jwt_url + '/user/wsUser/' + email;
    let response: ChorusUserUpdateResponse;

    // @@@PDC-634: Need to make calls to pdcapi more secure.
    // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
    //setTimeout(() => { this.getJWTTokenFromChorusAPI() },1000);

    const existsObservable = new Observable<boolean>((observer) => {
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer ' + localStorage.getItem('jwtToken')})}).subscribe(data => {
            response = data as ChorusUserUpdateResponse;
            console.log("checkUser resp: ");
            console.log(response);

            if ((!response.error) && (response.data.length > 0)) {
				console.log("checkUser resp Good");
				const user: ChorusUser = response.data[0];
				console.log("checkUser user: ");
				console.log(user);
				if (user != null) {
					sessionStorage.setItem('chorusKey', response.chorusKey);
					observer.next(true);
				}
				else {
					observer.next(false);
				}
            } else {
                observer.next(false);
            }
            observer.complete();
          },
          (error: HttpErrorResponse) => {
            console.log(error);
            observer.next(false);
            observer.complete();
          });
      }, 2000);
      });
      console.log("checkUser return: ");
      console.log(existsObservable);
      return existsObservable;
  }
  //@@@PDC-9083 pending ws registration
  public checkUserProgram(email: string): Observable<boolean> {

    email = sessionStorage.getItem('loginUser');

    if (!this.validateEmail(email)) {
      email = sessionStorage.getItem('loginEmail');
    }

    const url = environment.chorus_jwt_url + '/user/' + email;
    let response: ChorusUserUpdateResponse;

    const programExistsObservable = new Observable<boolean>((observer) => {
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer ' + localStorage.getItem('jwtToken')})}).subscribe(data => {
            console.log(data);
            response = data as ChorusUserUpdateResponse;
            console.log("checkUserProgram resp: ");
            console.log(response);

          // If we got a response then check to see if they have labs assigned
            if ((!response.error) && (response.data.length > 0)) {
              const user: ChorusUser = response.data[0];
              if (user.userLabMemberships.length > 0) {
				  console.log("checkUserProgram lab1: ");
				  console.log(user.userLabMemberships);
                sessionStorage.setItem('chorusKey', response.chorusKey);
                observer.next(true);
              } else {
				  console.log("checkUserProgram lab2: ");
				  console.log(user.userLabMemberships);
                observer.next(false);
              }
            } else {
              observer.next(false);
            }
            observer.complete();
          },
          (error: HttpErrorResponse) => {
            console.log(error);
            observer.next(false);
            observer.complete();
          });
      }, 2000);
      });
	  console.log("checkUserProgram return: ");
	  console.log(programExistsObservable);
      return programExistsObservable;
  }
  // Creates a new user in chorus
  public createUser(name: string, email: string, labIds: number[]): void {
    const url = '/workspace/security';

    // Separate name into first and last
    const split = name.split(' ');
    const firstName = split[0];
    const lastName = split[1];

    // First post to Chorus to create the user
    const payload = {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': this.password,
      'laboratories': labIds
    };

    this.http.post(url, payload).subscribe(data => {
        console.log(data);

        // Now since the user is created lets update it
        this.updateUser(email);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      });
  }

  // Updates the chorus user to set emailVerified to true so they can login without the email verification
  private updateUser(email: string) {
    const url = environment.chorus_jwt_url + '/user/' + email;

    // @@@PDC-634: Need to make calls to pdcapi more secure.
    // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
    //this.getJWTTokenFromChorusAPI();
    setTimeout(() => {
      this.http.put(url,null, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(data => {
          console.log(data);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        });
    }, 1000);
  }

  // @@@PDC-634: Need to make calls to CHORUSAPI more secure.
  // Makes a POST request to login service in CHORUSAPI to get a JWT. This valid token is used as an
  // authorization header for making secure calls to CHORUSAPI apis.
  private getJWTTokenFromChorusAPI() {
    this.http.post(environment.chorus_jwt_url + '/login', null).subscribe(data => {
      localStorage.setItem('jwtToken', data['token']);
      },
      (error: HttpErrorResponse) => {
        console.log("Error in fetching token from PDCAPI");
      });
  }

  // @@@PDC-812: get workspace url from environment object
  // Post to chorus to login the user
  public authenticateUser(email: string): Observable<boolean> {

    email = sessionStorage.getItem('loginUser');
    const password = sessionStorage.getItem('chorusKey');

    // @@@PDC-5894: NIH Federated Login creates a new username with user type id NIH which is not in WS table
    // Validate the username, if it's not email then get loginEmail
    if (!this.validateEmail(email)) {
      email = sessionStorage.getItem('loginEmail');
    }

    const url = '/workspace/j_spring_security_check';
    const payload = new FormData();

    payload.append('j_username', email);
    payload.append('j_password', password);

    const successObservable = new Observable<boolean>((observer) => {
    this.http.post(url, payload).subscribe(data => {
        console.log(data);
        // window.location.href = environment.workspace_url;
        window.open(environment.workspace_url, '_blank');
        observer.next(true);
        observer.complete();
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        // window.location.href = environment.workspace_url;
        window.open(environment.workspace_url, '_blank');
        observer.next(false);
        observer.complete();
      });
    });

    return successObservable;
  }

  // get labs that match the passed in term
  public searchLabs(term: string, selectedLabs: ChorusLab[]): Observable<ChorusLab[]> {
    const url = environment.chorus_jwt_url + '/lab?name=' + term;
    let response: ChorusLabResponse;

    const labsObservable = new Observable<ChorusLab[]>((observer) => {
      // If there was no term then do not bother calling the API
      if (!term.trim()) {
        observer.next([]);
        observer.complete();
      }
      // @@@PDC-634: Need to make calls to pdcapi more secure.
      // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
      //this.getJWTTokenFromChorusAPI();
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer ' + localStorage.getItem('jwtToken')})}).subscribe(resp => {
            response = resp as ChorusLabResponse;

            // If the labs returned are in the selectedLabs already remove them from the result
            for (let i = 0; i < response.data.length; i++) {
              for (let j = 0; j < selectedLabs.length; j++) {
                if (response.data[i].id === selectedLabs[j].id) {
                  response.data.splice(i, 1);
                }
              }
            }

            observer.next(response.data);
            observer.complete();
          },
          (error: HttpErrorResponse) => {
            console.log(error);
            observer.next(response.data);
            observer.complete();
          });
      }, 1000);
      });

    return labsObservable;
  }

  private validateEmail(email) {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  }
}
