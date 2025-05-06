import { Component, OnInit } from '@angular/core';
import { ConferencemanagmentService } from '../../services/conferencemanagment.service';
import { SponsorsmanagementService } from '../../services/sponsorsmangment.service';
import { MatDialog } from '@angular/material/dialog';
import { SponsorPopupComponent } from '../sponsors-popupcomonent/sponsors-popupcomonent.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';

interface Conference {
  conferenceId: number; // <-- supprimé le | null
  title: string;
  location: string;
  date: string;
  duration: string;
  description: string;
  likes: number;
  dislikes: number;
  images?: string[]; // Ajouté pour la galerie d'images
}

interface Sponsor {
  name: string;
  company: string;
}

@Component({
  selector: 'app-conference-view',
  templateUrl: './conference-view.component.html',
  styleUrls: ['./conference-view.component.css']
})
export class ConferenceViewComponent implements OnInit {
  conferences: Conference[] = [];
  sponsorsByConference: { [key: number]: Sponsor[] } = {};

  constructor(
    private conferenceService: ConferencemanagmentService,
    private sponsorService: SponsorsmanagementService,
    public dialog: MatDialog,
    public sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.conferenceService.getConferences().subscribe({
      next: (data: Conference[]) => {
        this.conferences = data.filter(conf => conf.conferenceId != null) as Conference[];
      },
      error: (err) => console.error('Error fetching conferences:', err)
    });
  }

  viewSponsors(conference: Conference): void {
    const confId = conference.conferenceId;

    if (this.sponsorsByConference[confId]) {
      delete this.sponsorsByConference[confId];
      return;
    }

    this.conferenceService.getSponsorsOfConference(confId).subscribe({
      next: (sponsors: Sponsor[]) => {
        this.sponsorsByConference[confId] = sponsors;
        this.openSponsorPopup(sponsors, confId);
      },
      error: (err) => console.error('Error fetching sponsors:', err)
    });
  }

  openSponsorPopup(sponsors: Sponsor[], confId: number): void {
    const dialogRef = this.dialog.open(SponsorPopupComponent, {
      data: sponsors
    });

    dialogRef.afterClosed().subscribe(() => {
      delete this.sponsorsByConference[confId];
    });
  }


    likeConference(conferenceId: number | null): void {
      if (conferenceId === null) {
        return;
      }
      this.conferenceService.likeConference(conferenceId).subscribe({
        next: () => {
          const conf = this.conferences.find(c => c.conferenceId === conferenceId);
          if (conf) {
            conf.likes += 1;  // Increment likes directly since we don't get the updated object
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleError('Erreur lors du like :', err);
        }
      });
    }
    
    dislikeConference(conferenceId: number | null): void {
      if (conferenceId === null) {
        return;
      }
      this.conferenceService.dislikeConference(conferenceId).subscribe({
        next: () => {
          const conf = this.conferences.find(c => c.conferenceId === conferenceId);
          if (conf) {
            conf.dislikes += 1;  // Increment dislikes directly
          }
        },
        error: (err: HttpErrorResponse) => {
          this.handleError('Erreur lors du dislike :', err);
        }
      });
    }
    
      private handleError(message: string, error: HttpErrorResponse): void {
        console.error(message, error);
        alert(message);  // Affichage d'un message générique
      }

  refreshConferences(): void {
    this.conferenceService.getConferences().subscribe({
      next: (data: Conference[]) => {
        this.conferences = data.filter(conf => conf.conferenceId != null) as Conference[];
      },
      error: (err) => console.error('Error fetching conferences:', err)
    });
  }

  getMapUrl(location: string): SafeResourceUrl {
    const url = 'https://www.google.com/maps?q=' + encodeURIComponent(location) + '&output=embed';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
