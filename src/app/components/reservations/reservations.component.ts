import { Component } from '@angular/core';
import { Session } from 'src/app/models/Session';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
})
export class ReservationsComponent {
  reservedSessions: Session[] = [];
  sessions: Session[] = [];
  constructor(
    private authService: AuthService,
    private paymentService: PaymentService,
    private sessionService: SessionService
  ) {}

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe(
      (data) => {
        this.sessions = data.filter((session) => !session.archived);
        this.loadReservedSessions();
      },
      (err) => {
        console.error('Erreur lors du chargement des sessions', err);
      }
    );
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  removeReservedSession(sessionId: number): void {
    this.reservedSessions = this.reservedSessions.filter(
      (s) => s.id !== sessionId
    );

    const userId = this.authService.getUserId();
    const session = this.sessions.find((s) => s.id === sessionId);
    if (session && userId) {
      session.reservations = session.reservations.filter(
        (r) => r.userId !== userId
      );
    }
    this.saveReservedSessions();
  }

  loadReservedSessions(): void {
    const saved = localStorage.getItem('reservedSessions');
    const userId = this.authService.getUserId();

    if (saved && userId) {
      const allReserved: Session[] = JSON.parse(saved);
      const now = new Date();
      const expiredSessionTitles: string[] = [];
      const validReservations: Session[] = [];

      allReserved.forEach((session) => {
        const userReservation = session.reservations.find(
          (r) => r.userId === userId
        );

        if (userReservation) {
          const reservationDate = new Date(userReservation.createdAt);
          const diffTime = now.getTime() - reservationDate.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (diffDays <= 3) {
            validReservations.push(session);
          } else {
            expiredSessionTitles.push(session.nom);
          }
        }
      });

      localStorage.setItem(
        'reservedSessions',
        JSON.stringify(validReservations)
      );
      this.reservedSessions = validReservations;

      this.reservedSessions.forEach((savedSession) => {
        const session = this.sessions.find((s) => s.id === savedSession.id);
        if (session) {
          session.reservations = savedSession.reservations;
        }
      });

      if (expiredSessionTitles.length > 0) {
        this.reservationCancelation(userId, expiredSessionTitles);
      }
    } else {
      this.reservedSessions = [];
    }
  }

  private saveReservedSessions(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const userReserved = this.sessions.filter((session) =>
      session.reservations.some((r) => r.userId === userId)
    );

    localStorage.setItem('reservedSessions', JSON.stringify(userReserved));
  }

  reservationCancelation(userId: number, sessions: string[]): void {
    this.paymentService.reservationCancelation(userId, sessions).subscribe({
      next: () => {
        console.log('Reservation canceled successfully');
      },
      error: (error) => {
        alert(error.error.message);
      },
    });
  }

  proceedToPayment(): void {
    const total = this.getTotalAmount();
    console.log('Total amount:', total);
    this.paymentService.createCheckoutSession(total).subscribe({
      next: ({ url }) => {
        window.location.href = url;
      },
      error: (err) => {
        console.error('Checkout session failed', err);
        alert('Could not start payment. Please try again.');
      },
    });
  }

  getTotalAmount(): number {
    return this.reservedSessions.reduce(
      (total, session) => total + session.prix,
      0
    );
  }
}
