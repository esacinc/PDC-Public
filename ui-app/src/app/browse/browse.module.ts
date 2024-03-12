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

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { StripHtmlTagsPipe } from './news/strip-html-tags.pipe';
import { ReactiveFormsModule} from '@angular/forms';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery,
ExperimentTypeCount, Filter } from '../types';

import { BrowseService } from './browse.service';
import { AuthGuardService } from '../auth-guard.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    FontAwesomeModule, CommonModule, MatCardModule, MatExpansionModule, PaginatorModule,
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
