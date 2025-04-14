import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { SidebarBackComponent } from './BackOffice/sidebar-back/sidebar-back.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { LoginComponent } from './components/login/login.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionListUserComponent } from './components/session-list-user/session-list-user.component';

const routes: Routes = [
  // Rediriger automatiquement vers login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'Inscription', component: InscriptionComponent },
  { path: 'sessionUser', component: SessionListUserComponent },

  { path: 'admin', component: AllTemplateBackComponent },
  { path: 'list', component: SessionListComponent },

  // Après login correct, on va vers cette page
  { path: 'home', component: AllTemplateFrontComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}