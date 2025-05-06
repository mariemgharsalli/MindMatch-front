import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';
import { SubmissionService } from 'src/app/services/submission.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent {
  diplomaFilesSelected: File[] = [];
  currentSessionId: number | null = null;
  currentSessionName: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private submissionService: SubmissionService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentSessionId = +params['id'];
      if (this.currentSessionId) {
        this.loadSessionDetails(this.currentSessionId);
      }
    });
  }

  loadSessionDetails(sessionId: number): void {
    this.sessionService.getSessionById(sessionId).subscribe({
      next: (session) => {
        this.currentSessionName = session.nom;
        console.log('Session chargée:', session.nom); // Debug
      },
      error: (error) => {
        console.error('Erreur chargement session:', error);
        Swal.fire('Erreur', 'Impossible de charger les détails de la session', 'error');
      }
    });
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.diplomaFilesSelected = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.isValidFileType(file)) {
        this.diplomaFilesSelected.push(file);
      } else {
        Swal.fire({
          title: 'Format invalide',
          text: 'Veuillez sélectionner uniquement des fichiers PDF ou images (JPG, PNG, JPEG, etc.)',
          icon: 'warning'
        });
        event.target.value = '';
        return;
      }
    }
  }

  isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/bmp',
      'image/svg+xml'
    ];
    return allowedTypes.includes(file.type);
  }

  submitDocuments(): void {
    // Vérifications
    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire('Erreur', 'Vous devez être connecté', 'error');
      return;
    }

    if (!this.currentSessionId) {
      Swal.fire('Erreur', 'Aucune session sélectionnée', 'error');
      return;
    }

    if (this.diplomaFilesSelected.length === 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner un fichier', 'warning');
      return;
    }

    const fileToUpload = this.diplomaFilesSelected[0];
    
    // Debug
    console.log('Envoi à la session:', {
      sessionId: this.currentSessionId,
      sessionName: this.currentSessionName,
      fileName: fileToUpload.name
    });

    this.submissionService.createSubmissionWithDocument(
      userId, 
      this.currentSessionId, 
      fileToUpload
    ).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Succès!',
          text: `CV soumis à la session: ${this.currentSessionName}`,
          icon: 'success'
        }).then(() => {
          this.router.navigate(['/sessionUser']);
        });
      },
      error: (error) => {
        console.error('Erreur soumission:', error);
        Swal.fire({
          title: 'Erreur',
          text: error.error?.message || 'Échec de la soumission',
          icon: 'error'
        });
      }
    });
  }

  closePopupAndNavigate() {
    this.router.navigate(['/sessionUser']);
  }
}