import { Apollo } from 'apollo-angular';
import { Observable, of } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
    MatAutocompleteModule, MatDialog, MatDialogModule, MatDialogRef, MatFormFieldModule,
    MatMenuModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgIdleModule } from '@ng-idle/core';

import { ChorusauthService } from '../chorusauth.service';
import { PDCUserService } from '../pdcuser.service';
import { NavbarComponent } from './navbar.component';
import { SearchStylePipe } from './search-style.pipe';
import { SearchService } from './search.service';

class MockDialogRef {
  afterClosed(): Observable<any> {
    return of(true);
  }

  updatePosition(any) {}
}
describe("NavbarComponent", () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let route: Router;
  let routeSpy: jasmine.Spy;
  let dialog: MatDialog;
  let dialogSpy: jasmine.Spy;
  let searchService: SearchService;
  let searchSpy: jasmine.Spy;
  let userService: PDCUserService;
  let chorusService: ChorusauthService;
  let chorusSpy: jasmine.Spy;
  let userSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent, SearchStylePipe],
      imports: [
        BrowserAnimationsModule,
        NgIdleModule.forRoot(),
        MatDialogModule,
        MatMenuModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([])
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ChorusauthService,
        Apollo,
        PDCUserService,
        SearchService,
        HttpClient
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("test open search term summary no match", () => {
    component.openSearchTermSummary("");
    fixture.detectChanges();
    expect(component.searchButtonFlag).toBeTruthy;
  });

  xit("test open search term summary with match", () => {
    component.selectedSearchTerm = {
      name: "GN: AAK1 (AP2 associated kinase 1)"
    };
    component.openSearchTermSummary("");

    route = TestBed.get(Router);
    routeSpy = spyOn(route, "navigate").and.callFake(() => of(true));

    dialog = TestBed.get(MatDialog);
    let mockDialogRef = new MockDialogRef();
    dialogSpy = spyOn(dialog, "open").and.returnValue(mockDialogRef);

    fixture.detectChanges();
    expect(component.searchButtonFlag).toBeFalsy;
  });

  it("search gene terms", () => {
    let genes = [];
    let gene = { name: "gn1", description: "gene1" };
    genes.push(gene);
    searchService = TestBed.get(SearchService);
    searchSpy = spyOn(searchService, "getGeneSearchResults").and.returnValue(
      of({ geneSearch: { genes: genes } })
    );
    component.searchGeneTerms("gn1");
    expect(searchSpy).toHaveBeenCalled();
  });

  it("search protein terms", () => {
    let proteins = [];
    let protein = {
      name: "pn123",
      description: "protein1",
      proteins: "pn1;pn2;pn3"
    };
    proteins.push(protein);
    searchService = TestBed.get(SearchService);
    searchSpy = spyOn(searchService, "getProteinSearchResults").and.returnValue(
      of({ proteinSearch: { genesWithProtein: proteins } })
    );
    component.searchProteinTerms("pn1");
    expect(searchSpy).toHaveBeenCalled();
  });

  it("search case terms", () => {
    let cases = [];
    let c1 = { name: "pn123", description: "protein1", case: "pn1;pn2;pn3" };
    cases.push(c1);
    searchService = TestBed.get(SearchService);
    searchSpy = spyOn(searchService, "getCaseSearchResults").and.returnValue(
      of({ caseSearch: { searchCases: cases } })
    );
    component.searchCaseTerms("ca1");
    expect(searchSpy).toHaveBeenCalled();
  });

  it("test ngOnInit", () => {
    component.ngOnInit();
  });

  it("test displayFunc", () => {
    let search_result = { name: "name" };
    expect(component.displayFunc(undefined)).toBe("");
    expect(component.displayFunc(search_result)).toBe("name");
  });

  it("test login", () => {
    component.userLoggedInFlag = false;
    dialog = TestBed.get(MatDialog);
    let mockDialogRef = new MockDialogRef();
    dialogSpy = spyOn(dialog, "open").and.returnValue(mockDialogRef);
    component.login();
    expect(dialogSpy).toHaveBeenCalled();
  });

  it("test open chorus with eixsting user", () => {
    userService = TestBed.get(PDCUserService);
    userService.setEmail("xxxyyy@esacinc.com");
    userService.setLoginUsername("username");
    chorusService = TestBed.get(ChorusauthService);
    chorusSpy = spyOn(chorusService, "checkUser").and.returnValue(of(true));
    let chorusSpy1 = spyOn(chorusService, "authenticateUser").and.returnValue(
      of(true)
    );
    component.openChorus();
    expect(chorusSpy).toHaveBeenCalledWith("xxxyyy@esacinc.com");
    expect(chorusSpy1).toHaveBeenCalledWith("xxxyyy@esacinc.com");
  });

  it("test open chorus without eixsting user", () => {
    userService = TestBed.get(PDCUserService);
    userService.setEmail("xxxyyy@esacinc.com");
    userService.setLoginUsername("username");
    chorusService = TestBed.get(ChorusauthService);
    chorusSpy = spyOn(chorusService, "checkUser").and.returnValue(of(false));

    dialog = TestBed.get(MatDialog);
    let mockDialogRef = new MockDialogRef();
    dialogSpy = spyOn(dialog, "open").and.returnValue(mockDialogRef);

    component.openChorus();
    expect(chorusSpy).toHaveBeenCalledWith("xxxyyy@esacinc.com");
    expect(dialogSpy).toHaveBeenCalled();
  });
});
