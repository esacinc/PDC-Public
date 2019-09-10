import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HeatmapViewerComponent} from './heatmap-viewer/heatmap-viewer.component';
import { AuthGuardService as AuthGuard } from '../auth-guard.service';

const analysisRoutes: Routes = [

    {
      path: 'analysis/:id',
      component: HeatmapViewerComponent
    }
];
@NgModule({
  imports: [
    RouterModule.forChild(analysisRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AnalysisRoutingModule { }
