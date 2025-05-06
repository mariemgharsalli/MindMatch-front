import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface SponsorsDTO {
  id?: number;
  name: string;
  company: string;
  email: string;
  contractSigned: boolean;
  conferenceId: number;
  sponsorshipAmount: number;
  contractExpiration: string | null;
  imageUrl?: string;
}



@Injectable({
  providedIn: 'root'
})
export class SponsorsmanagementService {
  private baseUrl = 'http://localhost:8088/api/sponsors';

  constructor(private http: HttpClient) {}

  // Méthodes existantes modifiées
  getAllSponsors(): Observable<SponsorsDTO[]> {
    return this.http.get<SponsorsDTO[]>(this.baseUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSponsor(id: number): Observable<SponsorsDTO> {
    return this.http.get<SponsorsDTO>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSponsorImage(filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/images/${filename}`, {
      responseType: 'blob'
    });
  }
  
  // Méthode modifiée pour gérer l'upload d'image
  addSponsorAndAssignToConference(sponsor: SponsorsDTO, image: File): Observable<SponsorsDTO> {
    const formData = new FormData();
    formData.append('sponsor', new Blob([JSON.stringify(sponsor)], {
      type: 'application/json'
    }));
    formData.append('image', image);

    return this.http.post<SponsorsDTO>(`${this.baseUrl}/add-and-assign`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Méthode modifiée pour gérer l'update avec image optionnelle
  updateSponsor(id: number, sponsor: SponsorsDTO, image?: File): Observable<SponsorsDTO> {
    const formData = new FormData();
    formData.append('sponsor', new Blob([JSON.stringify(sponsor)], {
      type: 'application/json'
    }));
    
    if (image) {
      formData.append('image', image);
    }

    return this.http.put<SponsorsDTO>(`${this.baseUrl}/${id}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteSponsor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Nouvelles méthodes pour les fonctionnalités supplémentaires
  removeSponsorFromConference(sponsorId: number, conferenceId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${sponsorId}/unassign/${conferenceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  isSponsorAssigned(sponsorId: number, conferenceId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${sponsorId}/assigned/${conferenceId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Méthodes existantes conservées mais avec le nouveau type SponsorsDTO
  getSponsorsByConferenceId(conferenceId: number): Observable<SponsorsDTO[]> {
    return this.http.get<SponsorsDTO[]>(`${this.baseUrl}/conferences/${conferenceId}/sponsors`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSponsorsOfConferencePublic(conferenceId: number): Observable<SponsorsDTO[]> {
    return this.http.get<SponsorsDTO[]>(`${this.baseUrl}/conferences/${conferenceId}/sponsors/public`)
      .pipe(
        catchError(this.handleError)
      );
  }

  

  // Gestion centralisée des erreurs
  private handleError(error: HttpErrorResponse) {
    console.error('Sponsor Service Error:', error);
    
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.status === 0) {
        errorMessage = 'Server connection error. Please check if the backend is running.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid data provided.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 403 || error.status === 401) {
        errorMessage = 'Authentication required.';
      } else if (error.status === 500) {
        errorMessage = error.error?.message || 'Internal server error.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}