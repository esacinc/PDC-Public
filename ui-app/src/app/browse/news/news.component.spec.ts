import { StripHtmlTagsPipe } from './strip-html-tags.pipe';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsComponent } from './news.component';
import { NewsService } from '../news.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;
  let service: NewsService;
  let serviceSpy: jasmine.Spy;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsComponent, StripHtmlTagsPipe],
      imports: [HttpClientTestingModule],
      schemas:[NO_ERRORS_SCHEMA],
      providers:[NewsService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(NewsService);
    serviceSpy = spyOn(service, 'getFeedContent').and.returnValue(of({items:''}));
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(serviceSpy).toHaveBeenCalledWith('http%3A%2F%2Ffeeds.feedburner.com%2FMCP_CurrentIssue');
    expect(serviceSpy).toHaveBeenCalledWith('https%3A%2F%2Fwww.proteinatlas.org%2Fnews%2Frss');
    expect(serviceSpy).toHaveBeenCalledWith('http%3A%2F%2Fwww.uniprot.org%2Fnews%2F?format=rss');
    expect(serviceSpy).toHaveBeenCalledWith('https%3A%2F%2Fgrants.nih.gov%2Fgrants%2Fguide%2Fnewsfeed%2Ffundingopps.xml');
  });
});