import { Injectable } from '@angular/core';


import {Response, Headers, RequestOptions} from '@angular/http';
import {HttpClient} from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import "rxjs/add/operator/map";


const DATA_DICTIONARY = 'assets/data-folder/dictionary.json';

@Injectable({
  providedIn: 'root'
})
export class DataDictionaryService {
  headers: Headers;
  options: RequestOptions;


  constructor(private http: HttpClient, private apollo: Apollo) {
    this.headers = new Headers({ 'Content-Type': 'application/json',
                                         'Accept': 'q=0.8;application/json;q=0.9' });
    this.options = new RequestOptions({ headers: this.headers });
    }

    // @@@PDC-363
    getDataDictionary() : Observable<any> {
      return this.http.get(DATA_DICTIONARY);
    }


}
