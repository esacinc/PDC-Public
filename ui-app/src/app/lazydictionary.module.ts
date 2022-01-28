import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DataDictionaryRoutingModule } from './data-dictionary/data-dictionary-routing.module';
import { DataDictionaryModule } from './data-dictionary/data-dictionary.module';
import { AuthGuardService as AuthGuard } from './auth-guard.service';


const routes: Routes = [
  //{ path: 'case-summary/:case_id', component: CaseSummaryComponent, outlet: 'caseSummary', canActivate: [AuthGuard]},
  //{ path: 'study-summary/:study_id', component: StudySummaryComponent, outlet: 'studySummary', canActivate: [AuthGuard]},
];

@NgModule({
  declarations: [
  ],
  imports: [
    DataDictionaryModule,
    DataDictionaryRoutingModule,
    RouterModule.forChild(routes),
  ]
})
// @@@PDC-516 angular lazy loading browse component
export class LazyDataDictionaryModule { }
