import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseByCaseComponent } from './browse-by-case/browse-by-case.component';
import { BrowseByStudyComponent } from './browse-by-study/browse-by-study.component';
import { BrowseByFileComponent } from './browse-by-file/browse-by-file.component';
import { BrowseByClinicalComponent } from './browse-by-clinical/browse-by-clinical.component';
import { BrowseByGeneComponent } from './browse-by-gene/browse-by-gene.component';
import { BrowseFiltersComponent } from './filters/browse-filters.component';
import { BrowseFiltersService } from './filters/browse-filters.service';
import { StudySummaryComponent } from './study-summary/study-summary.component';
import { FilesOverlayComponent } from './browse-by-file/files-overlay.component';
import { CaseSummaryComponent } from './case-summary/case-summary.component';
import { BrowseComponent } from './browse.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { AboutComponent } from './about/about.component';
import { NewsComponent } from './news/news.component';
import { NewsService} from './news.service';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';

import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';

import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule,
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule,
  MatProgressSpinnerModule, MatMenuModule, MatIconModule} from '@angular/material';
import { StripHtmlTagsPipe } from './news/strip-html-tags.pipe';
import { ReactiveFormsModule} from '@angular/forms';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery,
ExperimentTypeCount, Filter } from '../types';

import { BrowseService } from './browse.service';
import { AuthGuardService } from '../auth-guard.service';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
  imports: [
    AngularFontAwesomeModule, CommonModule, MatCardModule, MatExpansionModule, PaginatorModule,
    FormsModule, CheckboxModule, RadioButtonModule, TableModule, TabsModule.forRoot(),
    MatCardModule, MatToolbarModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonModule,
    MatSidenavModule, MatButtonModule, MatTooltipModule, DropdownModule, MatSelectModule,
	MatDialogModule, MatProgressSpinnerModule, ReactiveFormsModule, MatMenuModule, MatIconModule, RouterModule
  ],
  declarations: [ NewsComponent, StripHtmlTagsPipe,
          BrowseByCaseComponent, BrowseByStudyComponent, BrowseByFileComponent,
          BrowseByClinicalComponent, BrowseByGeneComponent, BrowseFiltersComponent, BrowseComponent],
  providers: [ BrowseService, BrowseFiltersService, NewsService, AuthGuardService ]
})

// @@@PDC-516 angular lazy loading
export class BrowseModule{ }
