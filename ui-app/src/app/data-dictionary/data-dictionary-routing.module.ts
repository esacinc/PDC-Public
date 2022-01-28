import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataDictionaryComponent } from './data-dictionary/data-dictionary.component';
import { DataDictionaryItemComponent } from './data-dictionary-item/data-dictionary-item.component';
import { DataDictionaryGraphComponent } from './data-dictionary-graph/data-dictionary-graph.component';
import { AuthGuardService as AuthGuard } from '../auth-guard.service';

const dictionaryRoutes: Routes = [
    {
        path: '',
        component: DataDictionaryComponent,
    },
    {
        path: 'data-dictionary-graph',
        component:  DataDictionaryGraphComponent
    },
    {
        path: ':eName',
        component:  DataDictionaryItemComponent
     }




];
/*
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
*/
@NgModule({
  imports: [
    RouterModule.forChild(dictionaryRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class DataDictionaryRoutingModule { }
