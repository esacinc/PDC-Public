import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApiDocumentationComponent } from './api-documentation.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';


import { Apollo } from "apollo-angular";
import { Observable, of } from "rxjs";

import { RouterTestingModule } from "@angular/router/testing";


describe('ApiDocumentationComponent', () => {
  let component: ApiDocumentationComponent;
  let fixture: ComponentFixture<ApiDocumentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ ApiDocumentationComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
