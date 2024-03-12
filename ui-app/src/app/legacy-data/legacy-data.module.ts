import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegacyDataComponent } from './legacy-data.component';
import { LegacyStudySummaryComponent } from './legacy-study-summary/legacy-study-summary.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DataViewModule } from 'primeng/dataview';

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
import { ReactiveFormsModule} from '@angular/forms';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery,
ExperimentTypeCount, Filter } from '../types';

import { LegacyDataService } from './legacy-data.service';
import { LegacyStudySummaryService } from './legacy-study-summary/legacy-study-summary.service';
import { AuthGuardService } from '../auth-guard.service';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    FontAwesomeModule, CommonModule, MatCardModule, MatExpansionModule, PaginatorModule,
    FormsModule, CheckboxModule, RadioButtonModule, DataViewModule, TableModule, TabsModule.forRoot(),
    MatCardModule, MatToolbarModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonModule,
    MatSidenavModule, MatButtonModule, MatTooltipModule, DropdownModule, MatSelectModule,
	MatDialogModule, MatProgressSpinnerModule, ReactiveFormsModule, MatMenuModule, MatIconModule
  ],
  declarations: [ LegacyDataComponent, LegacyStudySummaryComponent],
  providers: [ LegacyDataService, AuthGuardService, LegacyStudySummaryService ]
})

export class LegacyDataModule{ }
