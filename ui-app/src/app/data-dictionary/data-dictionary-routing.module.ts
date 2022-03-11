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

@NgModule({
  imports: [ 
    RouterModule.forChild(dictionaryRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class DataDictionaryRoutingModule { }
