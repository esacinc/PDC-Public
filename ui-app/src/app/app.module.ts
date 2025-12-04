import { MessageDialogComponent } from './dialog/message-dialog/message-dialog.component';
import { ConfirmationDialogComponent } from './dialog/confirmation-dialog/confirmation-dialog.component';
import { CaseSummaryComponent } from './browse/case-summary/case-summary.component';
import { AboutComponent } from './browse/about/about.component';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { TableModule } from 'primeng/table';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { NgIdleModule } from '@ng-idle/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { Md5 } from 'ts-md5';


import { NavbarComponent } from './navbar/navbar.component';
import { SearchService } from './navbar/search.service';
import { SearchStylePipe } from './navbar/search-style.pipe';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowseModule} from './browse/browse.module';
import { GenePageModule } from './gene-page/gene-page.module';
import { SizeUnitsPipe } from './sizeUnitsPipe.pipe';
import { GeneProteinSummaryComponent } from './gene-protein-summary/gene-protein-summary.component';
import { HomePageModule } from './home-page/home-page.module';
import { FrontPageService } from './home-page/front-page.service';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { RegistrationPageComponent } from './welcome-page/registration-page.component';
import {DataSubmissionModule} from './data-submission/data-submission.module';
import {AnalysisModule} from './analysis/analysis.module';
import { BottomNavbarComponent } from './bottom-navbar/bottom-navbar.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AnalysisRoutingModule } from './analysis/analysis-routing.module';
import { BrowseRoutingModule } from './browse/browse-routing.module';
import { ChorusauthService } from './chorusauth.service';
import { PDCUserService } from './pdcuser.service';
import { LabSelectionComponent } from './navbar/lab-selection/lab-selection.component';
import { LoginComponent } from './navbar/login/login.component';
import { environment } from '../environments/environment';
import { AuthGuardService } from './auth-guard.service';
import { StudySummaryComponent } from './browse/study-summary/study-summary.component';
import { FilesOverlayComponent } from './browse/browse-by-file/files-overlay.component';
import { PublicationFilesOverlayComponent } from './browse/browse-by-file/publication-files-overlay.component';
import { OverlayWindowComponent } from './overlay-window/overlay-window.component';
import { OverlayWindowService } from './overlay-window/overlay-window.service';
import { StudySummaryOverlayWindowComponent } from './browse/study-summary/study-summary-overlay-window/study-summary-overlay-window.component';
import { StudySummaryOverlayService } from './browse/study-summary/study-summary-overlay-window/study-summary-overlay-window.service';
import { PrivacyPolicyOverlayWindowComponent } from './overlay-window/privacy-policy-overlay-window/privacy-policy-overlay-window.component';
import { DUAForOtherProgramsOverlayWindow } from './browse/study-summary/study-summary-overlay-window/dua-other-programs/dua-other-programs-overlay-window.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { FaqComponent } from './navbar/faq/faq.component';
import { DataDownloadDocComponent } from './navbar/data-download-documentation/data-download-documentation.component';
import { RegistrationComponent } from './navbar/registration/registration.component';
import { ResetPasswordComponent } from './navbar/reset-password/reset-password.component';
import { SubmitDataFAQComponent } from './navbar/submit-data/submit-data.component';
import { RequestDataSubmissionComponent } from './navbar/request-data-submission/request-data-submission.component';
import { DataUseGuidelinesComponent } from './navbar/data-use-guidelines/data-use-guidelines.component';
import { PublicationsComponent } from './publications/publications.component';
import { PublicationsService } from './publications/publications.service';
import { ExploreQuantitationData } from './analysis/explore-quantitation-data/explore-quantitation-data.component';
import { LegacyDataModule } from './legacy-data/legacy-data.module';
import { LegacyDataService } from './legacy-data/legacy-data.service';
import { HeatmapsComponent } from './heatmaps/heatmaps.component';
import { HeatmapsService } from './heatmaps/heatmaps.service';
import { ForwardingComponent } from './forwarding/forwarding.component';
import { HarmonizationComponent } from './harmonization/harmonization.component';

import { DataDictionaryModule } from './data-dictionary/data-dictionary.module';
import { ApiDocumentationComponent } from './api-documentation/api-documentation.component';
import { PublicapiDocumentationComponent } from './publicapi-documentation/publicapi-documentation.component';
import { InputDialogComponent } from './dialog/input-dialog/input-dialog.component';
//@@PDC-5896-build pancancer page
import { PancancerComponent } from './pancancer/pancancer.component';
import { PancancerService } from './pancancer/pancancer.service';
import { DataCloudAnalysisComponent } from './analysis/data-cloud-analysis/data-cloud-analysis.component';

import { NavbarNciComponent } from './navbar-nci/navbar-nci.component';
import { HomePageNciModule } from './home-page-nci/home-page-nci.module';
import { FooterComponent } from './footer-nci/footer.component';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

const RECAPTCHA_V3_PDC_KEY = environment.recaptcha_site_key;

@NgModule({ declarations: [
        FooterComponent,
        NavbarComponent,
        AppComponent,
        BottomNavbarComponent,
        PageNotFoundComponent,
        LabSelectionComponent,
        LoginComponent,
        GeneProteinSummaryComponent,
        WelcomePageComponent,
        RegistrationPageComponent,
        AboutComponent,
        CaseSummaryComponent,
        StudySummaryComponent,
        FilesOverlayComponent,
        PublicationFilesOverlayComponent,
        OverlayWindowComponent,
        ConfirmationDialogComponent,
        InputDialogComponent,
        SizeUnitsPipe,
        MessageDialogComponent,
        StudySummaryOverlayWindowComponent,
        PrivacyPolicyOverlayWindowComponent,
        DUAForOtherProgramsOverlayWindow,
        UserAccountComponent,
        FaqComponent,
        RegistrationComponent,
        ResetPasswordComponent,
        SubmitDataFAQComponent,
        RequestDataSubmissionComponent,
        DataUseGuidelinesComponent,
        PublicationsComponent,
        ExploreQuantitationData,
        HeatmapsComponent,
        ForwardingComponent,
        HarmonizationComponent,
        ApiDocumentationComponent,
        PublicapiDocumentationComponent,
        DataDownloadDocComponent,
        PancancerComponent,
        DataCloudAnalysisComponent
    ],

    bootstrap: [AppComponent],

  imports: [
    NavbarNciComponent,
    HomePageNciModule,
    FontAwesomeModule,
    TableModule,
    OverlayPanelModule,
    ButtonModule,
    BrowserModule,
    LegacyDataModule,
    BrowserAnimationsModule,
    DataDictionaryModule,
    ApolloModule,
    // HttpLinkModule,
    // HttpModule,
    CheckboxModule,
    PaginatorModule,
    DataViewModule,
    MatButtonModule,
    MatToolbarModule,
    MatGridListModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    AppRoutingModule,
    FormsModule,
    MatCardModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatRadioModule,
    NgIdleModule.forRoot(),
    MaterialModule,
    MatProgressSpinnerModule,
    AnalysisModule,
    //AnalysisRoutingModule,
    DataSubmissionModule,
    OverlayModule,
    GenePageModule,
    MatCheckboxModule,
    MatListModule,
    MatExpansionModule,
    MatSelectModule,
    TooltipDirective
  ],
  providers:
    [
      ChorusauthService, FrontPageService, SearchService, PDCUserService, OverlayWindowService, PublicationsService, PancancerService,
        LegacyDataService, HeatmapsService, StudySummaryOverlayService, AuthGuardService,

        { provide: APP_BASE_HREF, useValue: window['_app_base'] || '/' },
        provideHttpClient(withInterceptorsFromDi())] })
// @@@PDC-168 The landing page for the PDC Node provides a summary view of the data that is in the PDC database.
// @@@PDC-169 The user should be able to browse data by Case
// @@@PDC-445 start using relative URLs
// @@@PDC-516 angular lazy loading
export class AppModule {
	constructor(apollo: Apollo, httpLink: HttpLink) {
		console.log(environment);
		let  graphql_server_url = environment.graphql_server_url;
		apollo.create({
			//Would need to make changes here to add google authentication to the queries
			link: httpLink.create({
				uri: graphql_server_url,
				//uri: 'https://pdc.esacinc.com/graphql',
				//uri: 'https://pdc-dev.esacinc.com/graphql',
				// uri: 'http://pdc.esacinc.com:3000/graphql',
				// uri: 'http://localhost:3000/graphql/',
				//withCredentials: true,
				method: 'GET'
				//credentials: 'same-origin'
			}),
			cache: new InMemoryCache()
		});
	}
}
