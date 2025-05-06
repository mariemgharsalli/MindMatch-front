import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Payment, PaymentStatus } from 'src/app/models/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-my-payments',
  templateUrl: './my-payments.component.html',
  styleUrls: ['./my-payments.component.css'],
})
export class MyPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = false;
  showDeleteConfirmation = false;
  paymentId: number | null = null;
  PaymentStatus = PaymentStatus;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  // Charger les paiements de l'utilisateur connecté
  loadPayments(): void {
    this.isLoading = true;
    const decodedToken = this.authService.getDecodedToken();
    this.paymentService
      .getPaymentsByUser(decodedToken.userId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          this.payments = response;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des paiements', error);
        },
      });
  }

  // Rediriger vers la page pour ajouter un paiement
  navigateToAddPayment(): void {
    this.router.navigate(['add-payment']);
  }

  // Rediriger vers la page d'édition du paiement
  navigateToEditPayment(id: number): void {
    this.router.navigate([`/update-payment/${id}`]);
  }

  // Supprimer un paiement
  deletePayment(id: number): void {
    this.isLoading = true;
    this.paymentService
      .deletePayment(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.showDeleteConfirmation = false;
          this.loadPayments();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du paiement', error);
        },
      });
  }

  // Annuler la suppression du paiement
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
  }

  // Confirmer la suppression du paiement
  confirmDelete(id: number): void {
    this.paymentId = id;
    this.showDeleteConfirmation = true;
  }
}
