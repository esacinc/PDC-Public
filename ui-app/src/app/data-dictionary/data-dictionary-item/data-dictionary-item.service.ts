import { Injectable, Inject } from '@angular/core';

import {Response, Headers, RequestOptions} from '@angular/http';
import {HttpClient} from '@angular/common/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';

import { map } from 'rxjs/operators';

//const DATA_DICTIONARY_ITEM = 'assets/data-folder/dictionary_item.json';
const DATA_DICTIONARY_ITEM = 'assets/data-folder/data-dictionary-json/';

@Injectable({
  providedIn: 'root'
})
export class DataDictionaryItemService {
  headers: Headers;
  options: RequestOptions;


  constructor(private http: HttpClient, private apollo: Apollo) {

    this.headers = new Headers({ 'Content-Type': 'application/json',
                                         'Accept': 'q=0.8;application/json;q=0.9' });
    this.options = new RequestOptions({ headers: this.headers });

  }

  getDataDictionaryItem(entity) : Observable<any> {
    console.log(entity.toLowerCase());
    return this.http.get(DATA_DICTIONARY_ITEM+entity.toLowerCase().replace(/\s/g, '').replace('-', '')+".json");

  }

}
