import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'angular-highcharts';
import { LegacyDataComponent } from './legacy-data.component';
import { LegacyStudySummaryComponent } from './legacy-study-summary/legacy-study-summary.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { Chart } from 'angular-highcharts';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DataViewModule } from 'primeng/dataview';

import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule, 
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule, 
  MatProgressSpinnerModule, MatMenuModule, MatIconModule} from '@angular/material';
import { ReactiveFormsModule} from '@angular/forms';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery,
ExperimentTypeCount, Filter } from '../types';

import { LegacyDataService } from './legacy-data.service';
import { LegacyStudySummaryService } from './legacy-study-summary/legacy-study-summary.service';
import { AuthGuardService } from '../auth-guard.service';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
  imports: [
    AngularFontAwesomeModule, CommonModule, ChartModule, MatCardModule, MatExpansionModule, PaginatorModule,
    FormsModule, CheckboxModule, RadioButtonModule, DataViewModule, TableModule, TabsModule.forRoot(),
    MatCardModule, MatToolbarModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonModule,
    MatSidenavModule, MatButtonModule, MatTooltipModule, DropdownModule, MatSelectModule, 
	MatDialogModule, MatProgressSpinnerModule, ReactiveFormsModule, MatMenuModule, MatIconModule
  ],
  declarations: [ LegacyDataComponent, LegacyStudySummaryComponent],
  providers: [ LegacyDataService, AuthGuardService, LegacyStudySummaryService ]
})

export class LegacyDataModule{ }
