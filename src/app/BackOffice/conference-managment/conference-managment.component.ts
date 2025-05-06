// Import necessary modules
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ConferencemanagmentService } from '../../services/conferencemanagment.service';
import { SponsorsmanagementService } from '../../services/sponsorsmangment.service';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Define interfaces for better typing
interface Conference {
  conferenceId: number | null;
  title: string;
  location: string;
  date: string;
  duration: string;
  description: string;
 
}

interface Sponsor {
  name: string;
  company: string;
}



interface UIState {
  isConferenceListVisible: boolean;
  showSponsorsPopup: boolean;

}

@Component({
  selector: 'app-conference-managment',
  templateUrl: './conference-managment.component.html',
  styleUrls: ['./conference-managment.component.css']
})
export class ConferencemanagmentComponent implements OnInit {
  @ViewChild('addConferenceModal') addConferenceModal!: ElementRef;
  @ViewChild('confForm') confForm!: NgForm;

  uiState: UIState = {
    isConferenceListVisible: false,
    showSponsorsPopup: false,
  
  };

  isConferenceListVisible: boolean = true;

  conferences: Conference[] = [];
  newConference: Conference = {
    conferenceId: null,
    title: '',
    location: '',
    date: '',
    duration: '',
    description: '',
    
  };

  editingConferenceId: number | null = null;
  editingConference: Partial<Conference> = {};
  selectedConferenceSponsors: Sponsor[] = [];
  selectedConferenceTitle: string = '';
  

  constructor(
    private conferenceService: ConferencemanagmentService,
    private sponsorService: SponsorsmanagementService
  ) {}

  ngOnInit(): void {
    this.loadConferences();
    
  }

  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(message, error);
    alert(message);  // Affichage d'un message générique
  }

  loadConferences(): void {
    this.conferenceService.getConferences().subscribe({
      next: (data: Conference[]) => {
        this.conferences = data;
      },
      error: (err: HttpErrorResponse) => {
        this.handleError('Erreur lors du chargement des conférences :', err);
      }
    });
  }

  createConference(): void {
    if (this.confForm.valid) {
      const confToSend: Omit<Conference, 'conferenceId'> = {
        title: this.newConference.title,
        location: this.newConference.location,
        date: this.newConference.date,
        duration: this.newConference.duration + ':00',
        description: this.newConference.description,
        
      };

      this.conferenceService.addConference(confToSend).subscribe({
        next: (conf: Conference) => {
          this.conferences.push(conf);
          this.resetForm();
          alert('Conférence ajoutée avec succès!');
        },
        error: (err: HttpErrorResponse) => {
          this.handleError('Erreur lors de l\'ajout de la conférence :', err);
        }
      });
    }
  }

  startEdit(conf: Conference): void {
    this.editingConferenceId = conf.conferenceId;
    this.editingConference = { ...conf };
  }

  updateConference(): void {
    if (this.editingConferenceId !== null && this.editingConference) {
      // Vérifier que toutes les propriétés requises sont présentes
      if (!this.editingConference.title || !this.editingConference.location || 
          !this.editingConference.date || !this.editingConference.duration) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Formater la durée pour s'assurer qu'elle a le bon format
      let formattedDuration = this.editingConference.duration;
      if (!formattedDuration.includes(':')) {
        formattedDuration = formattedDuration + ':00';
      }

      const updatedConf: Omit<Conference, 'conferenceId'> = {
        title: this.editingConference.title,
        location: this.editingConference.location,
        date: this.editingConference.date,
        duration: formattedDuration,
        description: this.editingConference.description || '',
      };

      console.log('Données envoyées:', updatedConf); // Pour le débogage

      this.conferenceService.updateConference(this.editingConferenceId, updatedConf).subscribe({
        next: (updated: Conference) => {
          const index = this.conferences.findIndex(c => c.conferenceId === this.editingConferenceId);
          if (index !== -1) {
            this.conferences[index] = updated;
          }
          this.cancelEdit();
          alert('Conférence mise à jour avec succès!');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Détails de l\'erreur:', err.error); // Pour le débogage
          this.handleError('Erreur lors de la mise à jour de la conférence :', err);
        }
      });
    }
  }

  cancelEdit(): void {
    this.editingConferenceId = null;
    this.editingConference = {};
  }

  deleteConference(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conférence ?')) {
      this.conferenceService.deleteConference(id).subscribe({
        next: () => {
          this.conferences = this.conferences.filter(c => c.conferenceId !== id);
          alert('Conférence supprimée avec succès.');
        },
        error: (err: HttpErrorResponse) => {
          this.handleError('Erreur lors de la suppression de la conférence :', err);
        }
      });
    }
  }

  resetForm(): void {
    this.newConference = {
      conferenceId: null,
      title: '',
      location: '',
      date: '',
      duration: '',
      description: '',
      
    };
    if (this.confForm) {
      this.confForm.resetForm();
    }
  }

  toggleConferenceList(): void {
    this.isConferenceListVisible = !this.isConferenceListVisible;
  }

  showSponsors(conference: Conference): void {
    this.selectedConferenceTitle = conference.title;
    if (conference.conferenceId === null) {
      console.error('Conference ID is null');
      return;
    }

    this.sponsorService.getSponsorsOfConferencePublic(conference.conferenceId).subscribe({
      next: (sponsors: Sponsor[]) => {
        this.selectedConferenceSponsors = sponsors.map(sponsor => ({
          name: sponsor.name || '',
          company: sponsor.company || ''
        }));
        this.uiState.showSponsorsPopup = true;
      },
      error: (err: HttpErrorResponse) => {
        this.handleError('Erreur lors du chargement des sponsors publics :', err);
      }
    });
  }

  closeSponsorsPopup(): void {
    this.uiState.showSponsorsPopup = false;
    this.selectedConferenceSponsors = [];
  }

  

  getRandomColor(conferenceName: string): string {
    let hash = 0;
    for (let i = 0; i < conferenceName.length; i++) {
      hash = conferenceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }


  
}
