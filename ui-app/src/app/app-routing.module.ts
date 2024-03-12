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
import { FilesOverlayComponent } from './browse/browse-by-file/files-overlay.component';
import { PublicationFilesOverlayComponent } from './browse/browse-by-file/publication-files-overlay.component';
import { GenePageComponent } from './gene-page/gene-page.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { SubmitDataFAQComponent } from './navbar/submit-data/submit-data.component'
import { RequestDataSubmissionComponent } from './navbar/request-data-submission/request-data-submission.component';
import { DataUseGuidelinesComponent } from './navbar/data-use-guidelines/data-use-guidelines.component';
import { PublicationsComponent } from './publications/publications.component';
import { ExploreQuantitationData } from './analysis/explore-quantitation-data/explore-quantitation-data.component';
import { LegacyDataComponent } from './legacy-data/legacy-data.component';
import { LegacyStudySummaryComponent } from './legacy-data/legacy-study-summary/legacy-study-summary.component';
import { HeatmapsComponent } from './heatmaps/heatmaps.component';
import { ForwardingComponent } from './forwarding/forwarding.component';
import { DataDownloadDocComponent } from './navbar/data-download-documentation/data-download-documentation.component';

import { AppComponent } from './app.component';
import { HarmonizationComponent } from './harmonization/harmonization.component';

import { DataDictionaryComponent } from './data-dictionary/data-dictionary/data-dictionary.component';
import { ApiDocumentationComponent } from './api-documentation/api-documentation.component';

//@@@PDC-4426 migrate publicapi-documentation
import { PublicapiDocumentationComponent } from './publicapi-documentation/publicapi-documentation.component';
//@@@PDC-5896-build pancancer page
import { PancancerComponent } from './pancancer/pancancer.component';
import { DataCloudAnalysisComponent } from './analysis/data-cloud-analysis/data-cloud-analysis.component';

const appRoutes: Routes = [
  //pdc url will be lazy loading when route redirect to 'pdc'.
  { path: 'pdc', loadChildren: () => import('./lazy.module').then(m => m.LazyModule)},
  { path: 'email-confirmed/:email',  loadChildren: () => import('./lazy.module').then(m => m.LazyModule)},
  { path: 'reset-password/:uuid',  loadChildren: () => import('./lazy.module').then(m => m.LazyModule)},
  //browse url will be lazy loading when route redirect to 'browse'
  { path: 'browse', loadChildren: () => import('./lazybrowse.module').then(m => m.LazyBrowseModule)},
  { path: 'fence', loadChildren: () => import('./lazybrowse.module').then(m => m.LazyBrowseModule)},
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
  { path: '', loadChildren: () => import('./lazy.module').then(m => m.LazyModule)},
  { path: 'submit-data', component: SubmitDataFAQComponent},
  //@@PDC-5500 - FAQ page link to data download client documentation page is broken
  { path: 'data-download-documentation', component: DataDownloadDocComponent },
  //@@@PDC-5758 - update how to submit page
  { path: 'request-data-submission', component: RequestDataSubmissionComponent},
  { path: 'data-use-guidelines', component: DataUseGuidelinesComponent},
  { path: 'data-use-guidelines/:id', component: DataUseGuidelinesComponent},
  { path: 'explore-quantitation-data', component: HeatmapsComponent},
  //@@@PDC-374 - adding auxiliary urls to overlay windows
  { path: 'gene-summary/:gene_id', component: GeneProteinSummaryComponent, outlet: 'geneSummary'},
  { path: 'case-summary/:case_id', component: CaseSummaryComponent, outlet: 'caseSummary'},
  { path: 'study-summary/:study_id', component: StudySummaryComponent, outlet: 'studySummary'},
  { path: 'files-overlay/:study_id', component: FilesOverlayComponent, outlet: 'filesOverlay'},
  { path: 'publication-files-overlay/:publication_id', component: PublicationFilesOverlayComponent, outlet: 'publicationFilesOverlay'},
  { path: 'case/:case_uuid', loadChildren: () => import('./lazybrowse.module').then(m => m.LazyBrowseModule)},
  { path: 'study/:study_uuid', loadChildren: () => import('./lazybrowse.module').then(m => m.LazyBrowseModule)},
  { path: 'data-dictionary', loadChildren:() => import('./lazydictionary.module').then(m => m.LazyDataDictionaryModule)},
  { path: 'publications', component: PublicationsComponent},
  { path: 'TechnologyAdvancementStudies', component: LegacyDataComponent },
  { path: 'legacy-study-summary/:study_id', component: LegacyStudySummaryComponent, outlet: 'studySummary'},
  /*{ path: 'heatmaps_page', component: HeatmapsComponent },*/
  /* { path: '', component: AppComponent,
    children: [ {path: 'browse', component: BrowseComponent}] }, */
  //*{ path: 'pdc', component: FrontPageComponent, canActivate: [AuthGuard] },
  { path: 'gene/:gene_id', component: GenePageComponent },
  { path: 'forwarding/:id', component: ForwardingComponent },
  { path: 'harmonization', component: HarmonizationComponent},
  { path: 'api-documentation', component: ApiDocumentationComponent},
  //@@@PDC-4426 migrate publicapi-documentation
  { path: 'publicapi-documentation', component: PublicapiDocumentationComponent},
  { path: 'cptac-pancancer', component: PancancerComponent},
  { path: 'cptac-pancancer/:id', component: PancancerComponent},
  { path: 'cloud-data-analysis', component: DataCloudAnalysisComponent},
  { path: 'cloud-data-analysis/:id', component: DataCloudAnalysisComponent},
  { path: '**', component: PageNotFoundComponent,  canActivate: [AuthGuard]},

  ];
@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      //@@PDC-4743 experiment type link load issues - allow anchor scrolling to navigate to property div
     //@@PDC-4743 experiment type link load issues - allow anchor scrolling to navigate to property div
//@@PDC-4743 experiment type link load issues - allow anchor scrolling to navigate to property div
//@@PDC-4743 experiment type link load issues - allow anchor scrolling to navigate to property div
{ anchorScrolling: 'enabled' }
     //  { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [RouterModule]
})
//@@@PDC-516 angular lazy loading
export class AppRoutingModule { }
