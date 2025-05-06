import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { SponsorsmanagementService } from '../../services/sponsorsmangment.service';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface SponsorsDTO {
  sponsorsId?: number;
  name: string;
  company: string;
  email: string;
  contractSigned: boolean;
  conferenceId: number;
  sponsorshipAmount: number;
  contractExpiration: string | null;
  imageUrl?: string;
}

interface ApiSponsor {
  id: number | null;
  name: string;
  company: string;
  email: string;
  contractSigned: boolean;
  conferenceId: number | null;
  sponsorshipAmount: number;
  contractExpiration: string | null;
}

@Component({
  selector: 'app-sponsor-management',
  templateUrl: './sponsors-managment.component.html',
  styleUrls: ['./sponsors-managment.component.css']
})
export class SponsorsmanagementComponent implements OnInit {
  conferenceId: number | null = null;
  sponsors: SponsorsDTO[] = [];
  selectedImage: File | undefined;
  showSponsorList = false;
  isLoading = false;

  newSponsor: SponsorsDTO = {
    name: '',
    company: '',
    email: '',
    contractSigned: false,
    conferenceId: 0,
    sponsorshipAmount: 0,
    contractExpiration: null
  };

  editingSponsorId: number | null = null;
  editingSponsor: SponsorsDTO | null = null;

  @ViewChild('sponsorForm') sponsorForm!: NgForm;

  constructor(
    private sponsorService: SponsorsmanagementService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('conferenceId');
      if (id) {
        this.conferenceId = +id;
        this.newSponsor.conferenceId = this.conferenceId;
        this.loadSponsorsByConference();
      } else {
        this.loadAllSponsors();
      }
    });
  }

  private mapApiSponsor(apiSponsor: ApiSponsor): SponsorsDTO {
    return {
      sponsorsId: apiSponsor.id || undefined,
      name: apiSponsor.name,
      company: apiSponsor.company,
      email: apiSponsor.email,
      contractSigned: apiSponsor.contractSigned,
      conferenceId: apiSponsor.conferenceId || 0,
      sponsorshipAmount: apiSponsor.sponsorshipAmount,
      contractExpiration: apiSponsor.contractExpiration
    };
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.sponsorForm?.dirty || this.editingSponsor) {
      $event.returnValue = true;
    }
  }

  toggleSponsorList(): void {
    this.showSponsorList = !this.showSponsorList;
  
    if (this.showSponsorList) {
      this.isLoading = true;
      this.sponsorService.getAllSponsors().subscribe({
        next: (sponsors) => {
          this.sponsors = sponsors;
          this.loadSponsorImages();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading sponsors', err);
          this.isLoading = false;
        }
      });
    }
  }
  

  loadSponsorImages(): void {
    this.sponsors.forEach(sponsor => {
      if (sponsor.imageUrl) { // Utilisez imageName au lieu de imageUrl
        this.sponsorService.getSponsorImage(sponsor.imageUrl).subscribe({
          next: (blob) => {
            const objectURL = URL.createObjectURL(blob);
            sponsor.imageUrl = objectURL;
          },
          error: (err) => {
            console.error('Error loading image for sponsor', sponsor.sponsorsId, err);
            sponsor.imageUrl = ""; // Ou une URL par défaut
          }
        });
      }
    });
  }
  
  loadSponsorsByConference(): void {
    if (this.conferenceId !== null) {
      this.isLoading = true;
      this.sponsorService.getSponsorsByConferenceId(this.conferenceId).subscribe({
        next: (data: SponsorsDTO[]) => {
          this.sponsors = data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading sponsors by conference:', err);
          this.isLoading = false;
          this.loadAllSponsors();
        }
      });
    } else {
      this.loadAllSponsors();
    }
  }

  loadAllSponsors(): void {
    this.sponsorService.getAllSponsors().subscribe({
      next: (sponsors) => {
        this.sponsors = sponsors;
        this.loadSponsorImages();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sponsors', err);
        this.isLoading = false;
      }
    });
  }
  
 

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    this.selectedImage = file || undefined;
  }

  createSponsor(): void {
    if (!this.sponsorForm || !this.sponsorForm.valid) {
      alert('Please fill in all required fields');
      return;
    }
  
    if (!this.newSponsor.conferenceId) {
      alert('Please specify a Conference ID');
      return;
    }
  
    if (!this.selectedImage) {
      alert('Please select an image');
      return;
    }
  
    this.isLoading = true;
    this.sponsorService.addSponsorAndAssignToConference(this.newSponsor, this.selectedImage).subscribe({
      next: (response: SponsorsDTO) => {
        this.createCustomAlert('Sponsor added successfully!', true);
        this.sponsors.push(response);
        this.resetForm();
        this.isLoading = false;
        this.selectedImage = undefined;
        if (this.conferenceId) {
          this.loadSponsorsByConference();
        } else {
          this.loadAllSponsors();
        }
      },
      error: (error: any) => {
        console.error('Full error details:', error);
        this.isLoading = false;
        this.createCustomAlert(error.message || 'An error occurred while adding the sponsor.', false);
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): Observable<string> {
    return new Observable(observer => {
      if (!imageUrl) {
        observer.next('');
        observer.complete();
        return;
      }
  
      this.sponsorService.getSponsorImage(imageUrl).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          observer.next(url);
          observer.complete();
        },
        error: () => {
          observer.next('');
          observer.complete();
        }
      });
    });
  }

  updateSponsor(): void {
    if (this.editingSponsor && this.editingSponsor.sponsorsId !== undefined) {
      this.isLoading = true;
      
      this.sponsorService.updateSponsor(
        this.editingSponsor.sponsorsId, 
        this.editingSponsor, 
        this.selectedImage
      ).subscribe({
        next: (updated: SponsorsDTO) => {
          const index = this.sponsors.findIndex(s => s.sponsorsId === this.editingSponsor?.sponsorsId);
          if (index > -1) this.sponsors[index] = updated;
          this.cancelEdit();
          this.isLoading = false;
          this.selectedImage = undefined;
        },
        error: (err: any) => {
          console.error('Error updating sponsor:', err);
          this.isLoading = false;
        }
      });
    }
  }

  startEdit(sponsor: SponsorsDTO): void {
    this.editingSponsor = { ...sponsor };
  }

  cancelEdit(): void {
    this.editingSponsorId = null;
    this.editingSponsor = null;
  }

  deleteSponsor(id: number): void {
    if (confirm('Are you sure you want to delete this sponsor?')) {
      this.isLoading = true;
      this.sponsorService.deleteSponsor(id).subscribe({
        next: () => {
          this.sponsors = this.sponsors.filter(s => s.sponsorsId !== id);
          this.isLoading = false;
          if (this.sponsors.length === 0) {
            this.loadAllSponsors();
          }
        },
        error: (err: any) => {
          console.error('Error deleting sponsor:', err);
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.newSponsor = {
      name: '',
      company: '',
      email: '',
      contractSigned: false,
      conferenceId: this.conferenceId || 0,
      sponsorshipAmount: 0,
      contractExpiration: null
    };
    this.selectedImage = undefined;
    if (this.sponsorForm) {
      this.sponsorForm.resetForm(this.newSponsor);
    }
  }

  private createCustomAlert(message: string, isSuccess: boolean): void {
    const alertContainer = document.createElement('div');
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '50%';
    alertContainer.style.left = '50%';
    alertContainer.style.transform = 'translate(-50%, -50%)';
    alertContainer.style.zIndex = '9999';
    alertContainer.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
    alertContainer.style.color = 'white';
    alertContainer.style.padding = '20px';
    alertContainer.style.borderRadius = '5px';
    alertContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    alertContainer.style.minWidth = '300px';
    alertContainer.style.textAlign = 'center';

    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.margin = '0 0 15px 0';
    alertContainer.appendChild(messageElement);

    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.padding = '8px 16px';
    okButton.style.backgroundColor = 'white';
    okButton.style.color = isSuccess ? '#4CAF50' : '#f44336';
    okButton.style.border = 'none';
    okButton.style.borderRadius = '4px';
    okButton.style.cursor = 'pointer';
    okButton.onclick = () => document.body.removeChild(alertContainer);
    alertContainer.appendChild(okButton);

    document.body.appendChild(alertContainer);

    setTimeout(() => {
      if (document.body.contains(alertContainer)) {
        document.body.removeChild(alertContainer);
      }
    }, 5000);
  }
}