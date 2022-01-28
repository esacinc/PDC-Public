import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataDictionaryComponent } from './data-dictionary/data-dictionary.component';
import { DataDictionaryItemComponent } from './data-dictionary-item/data-dictionary-item.component';


import {MatCardModule, MatExpansionModule, MatToolbarModule, MatCheckboxModule, MatListModule,
  MatTabsModule, MatButtonModule, MatSidenavModule, MatTooltipModule, MatSelectModule, MatDialogModule,
  MatProgressSpinnerModule, MatMenuModule, MatIconModule} from '@angular/material';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { ReactiveFormsModule} from '@angular/forms';
import { Chart } from 'angular-highcharts';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule} from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ChartModule } from 'angular-highcharts';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DataDictionaryGraphComponent } from './data-dictionary-graph/data-dictionary-graph.component';

@NgModule({
  imports: [
    AngularFontAwesomeModule, CommonModule, ChartModule, MatCardModule, MatExpansionModule, PaginatorModule,
    FormsModule, CheckboxModule, RadioButtonModule, TableModule, TabsModule.forRoot(),
    MatCardModule, MatToolbarModule, MatCheckboxModule, MatListModule, MatTabsModule, MatButtonModule,
    MatSidenavModule, MatButtonModule, MatTooltipModule, DropdownModule, MatSelectModule,
	MatDialogModule, MatProgressSpinnerModule, ReactiveFormsModule, MatMenuModule, MatIconModule
  ],
  declarations: [DataDictionaryComponent, DataDictionaryItemComponent, DataDictionaryGraphComponent]
})
export class DataDictionaryModule { }
