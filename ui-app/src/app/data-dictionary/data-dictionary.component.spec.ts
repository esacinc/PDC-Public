import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataDictionaryComponent } from './data-dictionary.component';
import { DataDictionaryService } from './data-dictionary.service';
import { Apollo } from "apollo-angular";
import { Observable, of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { NO_ERRORS_SCHEMA } from '@angular/core';

class MockDataDictionaryService {
  getDataDictionary() : Observable<any> {
    return of({ data: "" });
  }
}

describe('DataDictionaryComponent', () => {
  let component: DataDictionaryComponent;
  let fixture: ComponentFixture<DataDictionaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataDictionaryComponent ],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Apollo, useValue: {} },
        { provide: DataDictionaryService, useClass: MockDataDictionaryService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataDictionaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
