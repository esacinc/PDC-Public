import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/*This is a service class used for the API queries */
import * as d3 from 'd3';

@Injectable()
export class AnalysisService {

headers: HttpHeaders;
options: { };

constructor(private http: HttpClient) {
        this.headers = new HttpHeaders({ 'Content-Type': 'application/json',
                                     'Accept': 'q=0.8;application/json;q=0.9' });
        this.options = { headers: this.headers };
    }

    // Given a manifest file, get the contents as a JSON object
    getManifestFile(manifest_file: string) {

    }
}
