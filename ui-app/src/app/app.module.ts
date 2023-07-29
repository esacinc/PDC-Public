import { MessageDialogComponent } from './dialog/message-dialog/message-dialog.component';
import { ConfirmationDialogComponent } from './dialog/confirmation-dialog/confirmation-dialog.component';
import { CaseSummaryComponent } from './browse/case-summary/case-summary.component';
import { AboutComponent } from './browse/about/about.component';
import { MaterialModule } from './material.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CheckboxModule } from 'primeng/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { HttpClientModule} from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { MatButtonModule, MatToolbarModule, MatGridListModule, MatFormFieldModule,
	MatIconModule, MatTabsModule, MatInputModule, MatMenuModule, MatTooltipModule,
	MatCardModule, MatAutocompleteModule, MatRadioModule, MatProgressSpinnerModule,
	MatCheckboxModule, MatListModule, MatExpansionModule, MatSelectModule  } from '@angular/material';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import {
    SocialLoginModule,
    AuthServiceConfig,
    GoogleLoginProvider,
} from 'angular-6-social-login';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { NgIdleModule } from '@ng-idle/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { Md5 } from 'ts-md5';
import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RECAPTCHA_V3_SITE_KEY,
  RecaptchaV3Module
} from 'ng-recaptcha';

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


export function getAuthServiceConfigs() {

  const config = new AuthServiceConfig(
      [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(environment.google_oauth_client_id)
        }
      ]
  );

  return config;
}

const RECAPTCHA_V3_PDC_KEY = environment.recaptcha_site_key;

@NgModule({
  declarations: [
    NavbarComponent,
	AppComponent,
	BottomNavbarComponent,
	PageNotFoundComponent,
	LabSelectionComponent,
	LoginComponent,
	GeneProteinSummaryComponent,
	WelcomePageComponent,
	RegistrationPageComponent,
	SearchStylePipe,
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
  imports: [
	AngularFontAwesomeModule,
	TableModule,
	OverlayPanelModule,
	ButtonModule,
	BrowserModule,
	LegacyDataModule,
	BrowserAnimationsModule,
	DataDictionaryModule,
	HttpClientModule,
	ApolloModule,
	HttpLinkModule,
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
    SocialLoginModule,
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
  RecaptchaModule,
  RecaptchaFormsModule,
  RecaptchaV3Module
  ],

  providers: [ChorusauthService, FrontPageService, SearchService, PDCUserService, OverlayWindowService, PublicationsService,PancancerService,
				LegacyDataService, HeatmapsService, StudySummaryOverlayService, AuthGuardService,
				{ provide: AuthServiceConfig,	useFactory: getAuthServiceConfigs },
				{ provide: APP_BASE_HREF, useValue: window['_app_base'] || '/' },
        {
          provide: RECAPTCHA_V3_SITE_KEY,
          useValue: RECAPTCHA_V3_PDC_KEY
        }
			 ],
  bootstrap: [AppComponent],
  entryComponents: [LabSelectionComponent, LoginComponent, RegistrationComponent, GeneProteinSummaryComponent,
					OverlayWindowComponent, ConfirmationDialogComponent, InputDialogComponent, MessageDialogComponent, StudySummaryOverlayWindowComponent,
					PrivacyPolicyOverlayWindowComponent, DUAForOtherProgramsOverlayWindow, ResetPasswordComponent]
})
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
