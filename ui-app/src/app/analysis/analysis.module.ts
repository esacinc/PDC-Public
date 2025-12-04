import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatMapComponent } from './heat-map/heat-map.component';
import { MatCardMdImage, MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeHtmlPipe } from './heat-map/safe-html-pipe';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
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

@NgModule({ declarations: [HeatMapComponent, SafeHtmlPipe, AnalysisComponent, WorkflowManagerComponent, HeatmapViewerComponent], imports: [CommonModule,
        MatCardModule,
        MatTabsModule,
        MatTooltipModule,
        AnalysisRoutingModule,
        MatListModule,
        MatProgressSpinnerModule,
        TreeModule,
        MatSelectModule], providers: [AnalysisService, provideHttpClient(withInterceptorsFromDi())] })
export class AnalysisModule { }
