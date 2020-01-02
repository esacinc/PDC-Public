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

import { HttpClientModule} from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { MatButtonModule, MatToolbarModule, MatGridListModule, MatFormFieldModule,
	MatIconModule, MatTabsModule, MatInputModule, MatMenuModule, MatTooltipModule, 
	MatCardModule, MatAutocompleteModule, MatRadioModule, MatProgressSpinnerModule, MatCheckboxModule  } from '@angular/material';
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

import { NavbarComponent } from './navbar/navbar.component';
import { SearchService } from './navbar/search.service';
import { SearchStylePipe } from './navbar/search-style.pipe'; 
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowseModule} from './browse/browse.module';
import { GenePageModule } from './gene-page/gene-page.module';
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
import { OverlayWindowComponent } from './overlay-window/overlay-window.component';
import { OverlayWindowService } from './overlay-window/overlay-window.service';
import { StudySummaryOverlayWindowComponent } from './browse/study-summary/study-summary-overlay-window/study-summary-overlay-window.component';
import { StudySummaryOverlayService } from './browse/study-summary/study-summary-overlay-window/study-summary-overlay-window.service';
import { PrivacyPolicyOverlayWindowComponent } from './overlay-window/privacy-policy-overlay-window/privacy-policy-overlay-window.component';
import { DUAForOtherProgramsOverlayWindow } from './browse/study-summary/study-summary-overlay-window/dua-other-programs/dua-other-programs-overlay-window.component';
import { UserAccountComponent } from './user-account/user-account.component';
import { FaqComponent } from './navbar/faq/faq.component';
import { RegistrationComponent } from './navbar/registration/registration.component';
import { ResetPasswordComponent } from './navbar/reset-password/reset-password.component';
import { SubmitDataFAQComponent } from './navbar/submit-data/submit-data.component';

export function getAuthServiceConfigs() {

  const config = new AuthServiceConfig(
      [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider('79793275375-ocp5pv1ghc2mav4fgp16kv2v3fdfrumr.apps.googleusercontent.com')
        }
      ]
  );

  return config;
}

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
	OverlayWindowComponent,
	ConfirmationDialogComponent,
	MessageDialogComponent,
	StudySummaryOverlayWindowComponent,
	PrivacyPolicyOverlayWindowComponent,
	DUAForOtherProgramsOverlayWindow,
	UserAccountComponent,
	FaqComponent,
	RegistrationComponent,
	ResetPasswordComponent,
	SubmitDataFAQComponent
  ],
  imports: [
	AngularFontAwesomeModule,
	TableModule,
	OverlayPanelModule,
	BrowserModule,
	BrowserAnimationsModule,
	HttpClientModule,
	ApolloModule,
	HttpLinkModule,
	// HttpModule,
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
	MatCheckboxModule
  ],
  providers: [ChorusauthService, FrontPageService, SearchService, PDCUserService, OverlayWindowService, StudySummaryOverlayService, AuthGuardService,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
		},
		{ provide: APP_BASE_HREF, useValue: window['_app_base'] || '/' }
		],
  bootstrap: [AppComponent],
  entryComponents: [LabSelectionComponent, LoginComponent, RegistrationComponent, GeneProteinSummaryComponent, 
					OverlayWindowComponent, ConfirmationDialogComponent, MessageDialogComponent, StudySummaryOverlayWindowComponent, 
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
