import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllTemplateFrontComponent } from './FrontOffice/all-template-front/all-template-front.component';
import { AllTemplateBackComponent } from './BackOffice/all-template-back/all-template-back.component';
import { InscriptionComponent } from './components/inscription/inscription.component';
import { LoginComponent } from './components/login/login.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { SessionListUserComponent } from './components/session-list-user/session-list-user.component';
import { HomeFrontComponent } from './FrontOffice/home-front/home-front.component';
import { JitsiMeetComponent } from './components/jitsi-meet/jitsi-meet.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './auth.guard';
import { SubmissionsComponent } from './components/submissions/submissions.component';
import { ListUtilisateurComponent } from './components/list-utilisateur/list-utilisateur.component';
import { DocumentComponent } from './components/document/document.component';
import { PaymentComponent } from './BackOffice/payment/payment.component';
import { PaymentSuccessComponent } from './FrontOffice/payment-success/payment-success.component';
import { PaymentCancelComponent } from './FrontOffice/payment-cancel/payment-cancel.component';
import { MyPaymentsComponent } from './FrontOffice/my-payments/my-payments.component';
import { DailyPaymentStatisticsComponent } from './BackOffice/daily-payment-statistics/daily-payment-statistics.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { ConferenceViewComponent } from './FrontOffice/conference-view/conference-view.component';
import { ConferenceStatsComponent } from './components/conference-stats/conference-stats.component';
import { ConferencemanagmentComponent } from './BackOffice/conference-managment/conference-managment.component';
import { SponsorsmanagementComponent } from './BackOffice/sponsors-managment/sponsors-managment.component';

const routes: Routes = [
  // Redirection par défaut
  { path: '', pathMatch: 'full', component: LoginComponent }, // Ou laisser vide
  { path: 'login', component: LoginComponent },
  { path: 'Inscription', component: InscriptionComponent },

  {
    path: 'home',
    component: AllTemplateFrontComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'sessions',
    component: SessionListComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'meet',
    component: JitsiMeetComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'payment-success',
    component: PaymentSuccessComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'payment-cancel',
    component: PaymentCancelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'my-payments',
    component: MyPaymentsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  {
    path: 'reservations',
    component: ReservationsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'cv',
    component: DocumentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },

  {
    path: 'admin',
    component: AllTemplateBackComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN', 'ORGANIZER'] },
    // path: 'admin', component: AllTemplateBackComponent,
    children: [
      {
        path: 'payment',
        component: PaymentComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'daily-payment-statistics',
        component: DailyPaymentStatisticsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'sessions',
        component: SessionListComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'list',
        component: SessionListComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'submissions',
        component: SubmissionsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'listUsers',
        component: ListUtilisateurComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ADMIN'] },
      },
      {
        path: 'conference-management',
        component: ConferencemanagmentComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'sponsors-management',
        component: SponsorsmanagementComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'statconferences',
        component: ConferenceStatsComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
      {
        path: 'sponsors/:conferenceId',
        component: SponsorsmanagementComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ORGANIZER', 'ADMIN'] },
      },
    ],
  },

  {
    path: 'conferences',
    component: ConferenceViewComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },

  // Compatibilité avec anciennes routes
  {
    path: 'sessionUser',
    component: SessionListUserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['PARTICIPANT'] },
  },
  // { path: 'list', redirectTo: 'admin/sessions' },

  // Fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
