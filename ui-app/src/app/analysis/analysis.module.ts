import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { MatCardMdImage, MatCardModule, MatTabsModule, MatListModule, MatProgressSpinnerModule, 
        MatTooltipModule, MatSelectModule } from '@angular/material';
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
  declarations: [HeatMapComponent, SafeHtmlPipe, AnalysisComponent, 
    WorkflowManagerComponent, HeatmapViewerComponent],
  providers: [AnalysisService],
  entryComponents: [WorkflowManagerComponent]

})
export class AnalysisModule { }
