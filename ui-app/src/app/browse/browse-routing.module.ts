import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseByCaseComponent } from './browse-by-case/browse-by-case.component';
import { BrowseByClinicalComponent} from './browse-by-clinical/browse-by-clinical.component';
import { BrowseByFileComponent} from './browse-by-file/browse-by-file.component';
import { BrowseByStudyComponent} from './browse-by-study/browse-by-study.component';
import { BrowseByGeneComponent } from './browse-by-gene/browse-by-gene.component';
import { BrowseComponent } from './browse.component';
import { AuthGuardService as AuthGuard } from '../auth-guard.service';

//@@@PDC-728 Allow filtering based on URL parameters

const browseRoutes: Routes = [
    {
        path: '',
        component: BrowseComponent
    },
	{  path: 'filters/:filters', component: BrowseComponent},
    {
        path: ':study_id',
        component: BrowseComponent,
        children: [
        {
          path: 'tab/study',
          component: BrowseComponent,
        },
        {
            path: 'tab/clinical',
            component: BrowseComponent,
        },
        {
            path: 'tab/files',
            component: BrowseComponent,
        },
		{
			path: 'tab/genes',
            component: BrowseComponent,
		}
      ]
    }
//  { path: 'heatmap/:id',  component: HeatMapComponent },

 // { path: 'analysis/:id', component: AnalysisManagerComponent }
];
@NgModule({
  imports: [
    RouterModule.forChild(browseRoutes)
  ],
  exports: [
    RouterModule
  ]
})
// @@@PDC-516 angular lazy loading
export class BrowseRoutingModule { }
