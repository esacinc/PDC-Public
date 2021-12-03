import { TestBed,inject } from '@angular/core/testing';

import { DataDictionaryService } from './data-dictionary.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";

import { ApolloTestingModule, ApolloTestingController } from "apollo-angular/testing";


describe('DataDictionaryService', () => {
  beforeEach(() => {
     let apolloController: ApolloTestingController;
     let httpController: HttpTestingController;

     TestBed.configureTestingModule({
       providers: [DataDictionaryService],
       imports: [ApolloTestingModule, HttpClientTestingModule]
     });
     apolloController = TestBed.get(ApolloTestingController);
     httpController = TestBed.get(HttpTestingController);

     it("should be created", inject([DataDictionaryService], (service: DataDictionaryService) => {
       expect(service).toBeTruthy();
     }));

     it("test dataDictionary", inject([DataDictionaryService], (service: DataDictionaryService) => {
       service.getDataDictionary().subscribe(data => {
         expect(data).toBeDefined();
         expect(data.length).toBe(3);
       });

       const op = httpController.expectOne("assets/data-folder/dictionary.json");

       expect(op.request.method).toEqual("GET");

       op.flush([1, 2, 3]);

       httpController.verify();
     }));

});

});
