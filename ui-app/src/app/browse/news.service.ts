
import {throwError as observableThrowError, Observable} from 'rxjs';

import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NewsService {
  private rssToJsonServiceBaseUrl = 'https://rss2json.com/api.json?rss_url=';

  constructor(private http: HttpClient) { }
  getFeedContent(url: string): Observable<any> {
    return this.http.get(this.rssToJsonServiceBaseUrl + url).pipe(
            map(this.extractFeeds))
          //  .catch(this.handleError);
  }

  private extractFeeds(res: Response): any {
    const feed = res.json();
    return feed || { };
  }

  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return observableThrowError(errMsg);
  }
}
