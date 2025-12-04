import { Injectable } from '@angular/core';


import { HttpHeaders } from '@angular/common/http';
import {HttpClient} from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';


const DATA_DICTIONARY = 'assets/data-folder/data-dictionary-json/dictionary.json';

@Injectable({
  providedIn: 'root'
})
export class DataDictionaryService {
  headers: HttpHeaders;
  options: {};


  constructor(private http: HttpClient, private apollo: Apollo) {
    this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                         'Accept': 'q=0.8;application/json;q=0.9' });
    this.options = { headers: this.headers };
    }

    getDataDictionary() : Observable<any> {
      return this.http.get(DATA_DICTIONARY);
    }
}
