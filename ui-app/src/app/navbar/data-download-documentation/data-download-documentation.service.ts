import { Injectable } from '@angular/core';
import {Response, Headers, RequestOptions} from '@angular/http';
import {HttpClient} from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


//const DOWNLOAD_DOCUMENTATION = 'assets/data-folder/data-download-documentation/content.json';
const DOWNLOAD_DOCUMENTATION = '/dataDownloadDocumentation.json';

@Injectable({
  providedIn: 'root'
})
export class DataDownloadDocumentationService {
  headers: Headers;
  options: RequestOptions;

  //@@@PDC-5717: Develop the JSON file for the Data Download Page
  constructor(private http: HttpClient, private apollo: Apollo) {
        this.headers = new Headers({ 'Content-Type': 'application/json',
                                            'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
    }

    getDocumentation() : Observable<any> {
        return this.http.get(DOWNLOAD_DOCUMENTATION);
    }
}
