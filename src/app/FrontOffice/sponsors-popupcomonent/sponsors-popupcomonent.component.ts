import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SponsorsmanagementService } from 'src/app/services/sponsorsmangment.service';

// Déclare ton interface EN DEHORS du @Component
export interface Sponsor {
  id?: number;
  name: string;
  company: string;
  email: string;
  contractSigned: boolean;
  conferenceId: number;
  sponsorshipAmount: number;
  contractExpiration: string | null;
  imageUrl?: string;
  imageName?: string; // Ajouté si tu utilises imageName dans loadSponsorImages
}

@Component({
  selector: 'app-sponsor-popup',
  templateUrl: './sponsors-popupcomonent.component.html',
  styleUrls: ['./sponsors-popupcomonent.component.css']
})
export class SponsorPopupComponent implements OnInit {

  sponsors: Sponsor[] = [];

  constructor(
    private dialogRef: MatDialogRef<SponsorPopupComponent>,
    private sponsorService: SponsorsmanagementService,
    @Inject(MAT_DIALOG_DATA) public data: Sponsor[]
  ) {
    this.sponsors = data;
  }

  ngOnInit(): void {
    this.loadSponsorImages();
  }

  close(): void {
    this.dialogRef.close();
  }

  loadSponsorImages(): void {
    this.sponsors.forEach(sponsor => {
      if (sponsor.imageUrl && sponsor.imageUrl.startsWith('http')) {
        return;
      }

      if (sponsor.imageName) {
        // Utiliser le chemin relatif à assets/
        sponsor.imageUrl = 'assets/' + sponsor.imageName;
      } else {
        sponsor.imageUrl = "assets/default-sponsor.png";
      }
    });
  }
}
