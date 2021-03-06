import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ChorusUserUpdateResponse, ChorusUser, ChorusLabResponse, ChorusLab } from './types';
import { Observable } from 'rxjs';
import { environment } from "../environments/environment";

@Injectable()
export class ChorusauthService {

  password = 'PDCus3r6'; // Dummy password to use for all chorus users

  constructor(private http: HttpClient) { }

  // Checks to see if the user with this email exists already in Chorus
  // Since it is calling an asynchronous function it returns an observable so the caller can wait
  public checkUser(email: string): Observable<boolean> {
    const url = '/chorusapi/user/' + email;
    let response: ChorusUserUpdateResponse;

    // @@@PDC-634: Need to make calls to pdcapi more secure.
    // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
    setTimeout(() =>{this.getJWTTokenFromChorusAPI()},1000);

    const existsObservable = new Observable<boolean>((observer) => {
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer ' + localStorage.getItem('jwtToken')})}).subscribe(data => {
            console.log(data);
            response = data as ChorusUserUpdateResponse;

          // If we got a response then check to see if they have labs assigned
            if ((!response.error) && (response.data.length > 0)) {
              const user: ChorusUser = response.data[0];
              if (user.userLabMemberships.length > 0) {
                observer.next(true);
              } else {
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
      return existsObservable;
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
    const url = '/chorusapi/user/' + email;

    // @@@PDC-634: Need to make calls to pdcapi more secure.
    // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
    this.getJWTTokenFromChorusAPI();
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
    this.http.post('/chorusapi/login', null).subscribe(data => {
      localStorage.setItem('jwtToken', data['token']);
      },
      (error: HttpErrorResponse) => {
        console.log("Error in fetching token from PDCAPI");
      });
  }

  // @@@PDC-812: get workspace url from environment object
  // Post to chorus to login the user
  public authenticateUser(email: string): Observable<boolean> {
    const url = '/workspace/j_spring_security_check';
    const payload = new FormData();

    payload.append('j_username', email);
    payload.append('j_password', this.password);

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
    const url = '/chorusapi/lab?name=' + term;
    let response: ChorusLabResponse;

    const labsObservable = new Observable<ChorusLab[]>((observer) => {
      // If there was no term then do not bother calling the API
      if (!term.trim()) {
        observer.next([]);
        observer.complete();
      }
      // @@@PDC-634: Need to make calls to pdcapi more secure.
      // Get a JWT from ChorusAPI by a post call and use the token as authorization header while making the GET request.
      this.getJWTTokenFromChorusAPI();
      setTimeout(() => {
        this.http.get(url, {headers: new HttpHeaders({'authorization':'bearer '+localStorage.getItem('jwtToken')})}).subscribe(resp => {
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
}
