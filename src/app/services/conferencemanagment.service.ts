import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConferencemanagmentService {

  private apiUrl = 'http://localhost:8088/api/conferences';

  constructor(private http: HttpClient) {}

  // Récupère toutes les conférences
  getConferences(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  // Ajoute une nouvelle conférence
  addConference(conf: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, conf).pipe(
      catchError(this.handleError)
    );
  }

  // Met à jour une conférence existante
  updateConference(id: number, updatedConf: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updatedConf).pipe(
      catchError(this.handleError)
    );
  }

  // Supprime une conférence
  deleteConference(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupère les sponsors d'une conférence
  getSponsorsOfConference(idconf: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idconf}/sponsors`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupère les sponsors publics d'une conférence
  getSponsorsOfConferencePublic(conferenceId: number): Observable<any[]> {
    return this.http.get<any[]>(`/api/conferences/${conferenceId}/public-sponsors`).pipe(
      catchError(this.handleError)
    );
  }

  // Récupère les statistiques des conférences par mois
  getConferenceStatsPerMonth(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8088/api/conferences/stats/conferences-per-month`).pipe(
      catchError(this.handleError)
    );
  }

  likeConference(conferenceId: number | null): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${conferenceId}/like`, {}).pipe(
      catchError(this.handleError)
    );
  }
  
  // N'aime pas une conférence
  dislikeConference(conferenceId: number | null): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${conferenceId}/dislike`, {}).pipe(
      catchError(this.handleError)
    );
  }
  
  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('Une erreur est survenue :', error);
    throw error;  // Ou retourner un Observable avec un message d'erreur pour afficher dans l'UI
  }
}
