import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrontPageComponent } from './front-page/front-page.component';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ProgramStatsComponent } from './program-stats/program-stats.component';
import { HumanBodyChartComponent } from './front-page/human-body-chart/human-body-chart.component';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
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
