import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowseRoutingModule } from './browse/browse-routing.module';
import { BrowseModule } from './browse/browse.module';
import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { StudySummaryComponent } from './browse/study-summary/study-summary.component';
import { CaseSummaryComponent } from './browse/case-summary/case-summary.component';

const routes: Routes = [
  //{ path: 'case-summary/:case_id', component: CaseSummaryComponent, outlet: 'caseSummary', canActivate: [AuthGuard]},
  //{ path: 'study-summary/:study_id', component: StudySummaryComponent, outlet: 'studySummary', canActivate: [AuthGuard]},
];

@NgModule({
  declarations: [
  ],
  imports: [
    BrowseModule,
    BrowseRoutingModule,
    RouterModule.forChild(routes),
  ]
})
// @@@PDC-516 angular lazy loading browse component
export class LazyBrowseModule { }
