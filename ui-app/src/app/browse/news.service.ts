import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Response } from "@angular/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";


@Injectable()
export class NewsService {
  private rssToJsonServiceBaseUrl = "https://rss2json.com/api.json?rss_url=";

  constructor(private http: HttpClient) {}
  getFeedContent(url: string): Observable<any> {
    return this.http.get(this.rssToJsonServiceBaseUrl + url).pipe(map(this.extractFeeds));
  }

  private extractFeeds(res: Response): any {
    const feed = res.json();
    return feed || {};
  }
}
