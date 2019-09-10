import { Injectable } from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';


import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';

import { QueryDiseases, ExperimentTypeCount, AnalyticFractionCount } from '../types';
import { HttpClient } from '@angular/common/http';

/*This is a service class used for the API queries */
import * as d3 from 'd3';

@Injectable()
export class AnalysisService {

headers: Headers;
options: RequestOptions;

constructor(private http: HttpClient) {
        this.headers = new Headers({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = new RequestOptions({ headers: this.headers });
    }

    // Given a manifest file, get the contents as a JSON object
    getManifestFile(manifest_file: string) {
        
    }
}
