import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GenePageComponent } from './gene-page.component';
import { AuthGuardService as AuthGuard } from '../auth-guard.service';

//@@@PDC-728 Allow filtering based on URL parameters

const genePageRoutes: Routes = [
    {  path: '', component: GenePageComponent },
	{  path: 'filters/:filters', component: GenePageComponent},
    {  path: ':study_id', component: GenePageComponent },
//  { path: 'heatmap/:id',  component: HeatMapComponent },

 // { path: 'analysis/:id', component: AnalysisManagerComponent }
];
@NgModule({
  imports: [
    RouterModule.forChild(genePageRoutes)
  ],
  exports: [
    RouterModule
  ]
})
// @@@PDC-516 angular lazy loading
export class GenePageRoutingModule { }
