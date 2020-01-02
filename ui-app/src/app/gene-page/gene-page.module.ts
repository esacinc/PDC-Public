import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneFiltersComponent } from './gene-filters/gene-filters.component';
import { GeneFiltersService } from './gene-filters/gene-filters.service';
import { GenePageComponent } from './gene-page.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { Chart } from 'angular-highcharts';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DialogModule }  from 'primeng/dialog';
import { OncoprintComponent } from './oncoprintjs/oncoprint.component';

import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule, 
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule, 
  MatProgressSpinnerModule, MatMenuModule, MatIconModule} from '@angular/material';
import { ReactiveFormsModule} from '@angular/forms';

import { TissueSite, QueryTissueSites, QueryDiseases, Disease, Program,
QueryPrograms, Project, QueryCases, Case, DiseaseType, DiseaseTypeQuery,
ExperimentTypeCount, Filter } from '../types';

import { GenePageService } from './gene-page.service';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
  imports: [
    AngularFontAwesomeModule, CommonModule, MatExpansionModule, PaginatorModule,
    FormsModule, CheckboxModule, TableModule, TabsModule.forRoot(),
    MatCardModule, MatToolbarModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonModule,
    MatSidenavModule, MatButtonModule, MatTooltipModule, DropdownModule, OverlayPanelModule, DialogModule, MatSelectModule, 
	MatDialogModule, MatProgressSpinnerModule, ReactiveFormsModule, MatMenuModule, MatIconModule
  ],
  declarations: [ GeneFiltersComponent, GenePageComponent, OncoprintComponent],
  providers: [ GenePageService, GeneFiltersService]
})

export class GenePageModule{ }
