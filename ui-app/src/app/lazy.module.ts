import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePageModule } from './home-page/home-page.module';
import { AuthGuardService as AuthGuard } from './auth-guard.service';
import { FrontPageComponent } from './home-page/front-page/front-page.component';

const routes: Routes = [
  { path: '', component: FrontPageComponent},
];

@NgModule({
  declarations: [
  ],
  imports: [
    HomePageModule,	
    RouterModule.forChild(routes),
  ]
})
//@@@PDC-516 angular lazy loading front page
export class LazyModule { }
