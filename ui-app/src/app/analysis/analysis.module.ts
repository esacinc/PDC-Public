import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { MatLegacyCardMdImage as MatCardMdImage, MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { SafeHtmlPipe } from './heat-map/safe-html-pipe';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AnalysisRoutingModule } from './analysis-routing.module';
import { AnalysisComponent } from './analysis.component';
import { WorkflowManagerComponent } from './workflow-manager/workflow-manager.component';
import {TreeModule} from 'primeng/tree';
import {TreeNode} from 'primeng/api';
import { AnalysisService } from './analysis.service';
import { HeatmapViewerComponent } from './heatmap-viewer/heatmap-viewer.component';

@NgModule({
  imports: [
    CommonModule,
    MatCardModule,
    HttpClientModule,
    MatTabsModule,
    MatTooltipModule,
    AnalysisRoutingModule,
    MatListModule,
    MatProgressSpinnerModule, 
    TreeModule,
    MatSelectModule
  ],
  declarations: [HeatMapComponent, SafeHtmlPipe, AnalysisComponent, WorkflowManagerComponent, HeatmapViewerComponent],
  providers: [AnalysisService],
  //@@@PDC-5047: Investigate file download issues that's causing an auto scaling event
  //Comment code that's causing auto scaling event
  //WorkflowManagerComponent is not used anywhere, so comment its declaration
  //entryComponents: [WorkflowManagerComponent]

})
export class AnalysisModule { }
