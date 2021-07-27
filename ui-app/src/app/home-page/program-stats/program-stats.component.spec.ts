import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontPageService } from '../front-page.service';
import { ProgramStatsComponent } from './program-stats.component';

class MockFrontPageService {
  getPortalStats(): Observable<any> {
    //@@@PDC-1123 call ui wrapper API
    return of({
      uiPdcDataStats: [
        {
          program: 1,
          project: 2,
          data_file: 3,
          data_size: 4,
          spectra: 5,
          peptide: 6,
          protein: 7
        }
      ]
    });
  }
}

describe("ProgramStatsComponent", () => {
  let component: ProgramStatsComponent;
  let fixture: ComponentFixture<ProgramStatsComponent>;
  let service: FrontPageService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgramStatsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FrontPageService, useClass: MockFrontPageService },
        { provide: Apollo, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    service = TestBed.get(FrontPageService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("test get all program data on ngInit", () => {
    let serviceSpy = spyOn(service, "getPortalStats").and.callThrough();
    component.ngOnInit();
    expect(serviceSpy).toHaveBeenCalledTimes(1);
    expect(component.programsCounter).toBe(1);
    expect(component.projectsCounter).toBe(2);
    expect(component.filesCounter).toBe(3);
    expect(component.dataSize).toBe(4);
    expect(component.spectraCounter).toBe(5);
    expect(component.peptideCounter).toBe(6);
    expect(component.proteinCounter).toBe(7);
  });
});
