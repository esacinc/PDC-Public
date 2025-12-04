import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageComponent } from './front-page/front-page.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ProgramStatsComponent } from './program-stats/program-stats.component';
import { HumanBodyChartComponent } from './front-page/human-body-chart/human-body-chart.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  providers: [
	//PDC-3683 - after Highcharts upgrade sunburst.src caused an error when deployed with -prod flag
    //{ provide: HIGHCHARTS_MODULES, useFactory: () => [ highchartsSunburst ] } 
  ],	
  imports: [
    CommonModule,
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
