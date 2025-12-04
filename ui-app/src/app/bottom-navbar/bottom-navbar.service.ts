import {Injectable} from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import {Apollo} from 'apollo-angular';
import {map} from 'rxjs/operators';
import gql from 'graphql-tag';
import {QueryReleaseVersionData} from '../types';

/*This is a service class used for the API queries */

//@@@PDC-3163: Add data release version to the UI
@Injectable()
export class BottomNavbarService {
  headers: HttpHeaders;
  options: {};

  constructor(private apollo: Apollo) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'q=0.8;application/json;q=0.9'
    });
    this.options = {headers: this.headers};
  }

  releaseVersionsQuery = gql`
        query uiDataVersionSoftwareVersion {
            uiDataVersionSoftwareVersion {
                data_release
                build_tag
            }
        } `;

  //@@@PDC-3163: Add data release version to the UI
  getReleaseVersionDetails() {
    return this.apollo.watchQuery<QueryReleaseVersionData>({
      query: this.releaseVersionsQuery
    })
      .valueChanges
      .pipe(
        map(result => {
          console.log(result.data);
          return result.data;
        })
      );
  }
}
