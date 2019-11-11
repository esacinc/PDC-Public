import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageComponent } from './front-page/front-page.component';
import { ChartModule, HIGHCHARTS_MODULES } from 'angular-highcharts';
import * as highchartsSunburst from 'highcharts/modules/sunburst.src';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ProgramStatsComponent } from './program-stats/program-stats.component';
import { HumanBodyChartComponent } from './front-page/human-body-chart/human-body-chart.component';
import { MatToolbarModule, MatCardModule, MatGridListModule, MatListModule, MatIconModule, MatTooltipModule } from '@angular/material';
@NgModule({
  providers: [
    { provide: HIGHCHARTS_MODULES, useFactory: () => [ highchartsSunburst ] } 
  ],	
  imports: [
    CommonModule,
    ChartModule,
    FormsModule,
    CheckboxModule,
    TableModule,
    MatToolbarModule,
    MatCardModule,
    MatGridListModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule
  ],
  declarations: [FrontPageComponent, ProgramStatsComponent, HumanBodyChartComponent]
})
export class HomePageModule { }
