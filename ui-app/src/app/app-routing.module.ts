import { HeatmapViewerComponent } from './analysis/heatmap-viewer/heatmap-viewer.component';
import { AboutComponent } from './browse/about/about.component';
import { FaqComponent } from './navbar/faq/faq.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseComponent} from './browse/browse.component';
import { SubmitDataComponent } from './data-submission/submit-data/submit-data.component';
import { NewsComponent} from './browse/news/news.component';
import { FrontPageComponent } from './home-page/front-page/front-page.component';
import { PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { RegistrationPageComponent } from './welcome-page/registration-page.component';
import { GeneProteinSummaryComponent } from './gene-protein-summary/gene-protein-summary.component';
import { CaseSummaryComponent } from './browse/case-summary/case-summary.component';
import { StudySummaryComponent } from './browse/study-summary/study-summary.component';
import { GenePageComponent } from './gene-page/gene-page.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { SubmitDataFAQComponent } from './navbar/submit-data/submit-data.component'
import { RequestDataSubmissionComponent } from './navbar/request-data-submission/request-data-submission.component';
import { DataUseGuidelinesComponent } from './navbar/data-use-guidelines/data-use-guidelines.component';

import { AppComponent } from './app.component';

const appRoutes: Routes = [
  //pdc url will be lazy loading when route redirect to 'pdc'.
  { path: 'pdc', loadChildren: './lazy.module#LazyModule'},
  { path: 'email-confirmed/:email',  loadChildren: './lazy.module#LazyModule'},
  { path: 'reset-password/:uuid',  loadChildren: './lazy.module#LazyModule'},
  //browse url will be lazy loading when route redirect to 'browse'
  { path: 'browse', loadChildren: './lazybrowse.module#LazyBrowseModule'},
  { path: 'fence', loadChildren: './lazybrowse.module#LazyBrowseModule'},
  //{ path: 'about', loadChildren: './lazyabout.module#LazyAboutModule'},
  //{ path: 'analysis', loadChildren: './lazyanalysis.module#LazyAnalysisModule'},
  // { path: 'browse', component: BrowseByStudyComponent },
  // { path: 'browse', component: BrowseComponent, canActivate: [AuthGuard] },
  // { path: 'browse/tab/:open', component: BrowseComponent },
  { path: 'submit', component: SubmitDataComponent },
 // { path: 'analysis', component: HeatMapComponent },
 // { path: 'analysis/:analysis_id', component: AnalysisManagerComponent },
  { path: 'welcome', component: WelcomePageComponent },
  //{ path: 'registration', component: RegistrationPageComponent},
  {path: 'user-account', component: UserAccountComponent},
  //*{ path: 'news', component: NewsComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent},
  { path: 'faq', component: FaqComponent },
  //@@@PDC-1702: Add a button/help link to FAQ page multiple download section from Browse page
  { path: 'faq/:id', component: FaqComponent },
  { path: 'analysis/:id', component: HeatmapViewerComponent},
  { path: '', loadChildren: './lazy.module#LazyModule'},
  { path: 'submit-data', component: SubmitDataFAQComponent},
  { path: 'request-data-submission', component: RequestDataSubmissionComponent},
  { path: 'data-use-guidelines', component: DataUseGuidelinesComponent},
  //@@@PDC-374 - adding auxiliary urls to overlay windows
  { path: 'gene-summary/:gene_id', component: GeneProteinSummaryComponent, outlet: 'geneSummary'},
  { path: 'case-summary/:case_id', component: CaseSummaryComponent, outlet: 'caseSummary'},
  { path: 'study-summary/:study_id', component: StudySummaryComponent, outlet: 'studySummary'},
  { path: 'case/:case_uuid', loadChildren: './lazybrowse.module#LazyBrowseModule'},
  { path: 'study/:study_uuid', loadChildren: './lazybrowse.module#LazyBrowseModule'},
  /* { path: '', component: AppComponent,
    children: [ {path: 'browse', component: BrowseComponent}] }, */
  //*{ path: 'pdc', component: FrontPageComponent, canActivate: [AuthGuard] },
  { path: 'gene/:gene_id', component: GenePageComponent },
  { path: '**', component: PageNotFoundComponent },

  ];
@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
     //  { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [RouterModule]
})
//@@@PDC-516 angular lazy loading
export class AppRoutingModule { }
