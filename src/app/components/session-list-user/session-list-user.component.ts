import { Component, OnInit, OnDestroy } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { Session } from 'src/app/models/Session';
import * as L from 'leaflet';
import { SubmissionService } from 'src/app/services/submission.service';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Reservation } from 'src/app/models/reservation.model';

declare var JitsiMeetExternalAPI: any; // déclaration pour Jitsi

@Component({
  selector: 'app-session-list-user',
  templateUrl: './session-list-user.component.html',
  styleUrls: ['./session-list-user.component.css'],
})
export class SessionListUserComponent implements OnInit, OnDestroy {
  selectedSession: Session | null = null;
  searchTerm = '';
  showJitsiModal = false;
  currentUserName = 'Utilisateur';
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  reservedSessions: Session[] = [];
  showMapModal = false;
  mapInitialized = false;
  chatbotVisible = false;
  jitsiApi: any; // Instance de Jitsi Meet API

  constructor(
    private sessionService: SessionService,
    private submissionSerivce: SubmissionService,
    private authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.initLeaflet();
  }

  ngOnDestroy(): void {
    this.destroyMap();
    this.destroyJitsi();
  }

  private initLeaflet(): void {
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';

    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    this.mapInitialized = true;
  }

  loadSessions(): void {
    this.sessionService.getAllSessions().subscribe(
      (data) => {
        this.sessions = data.filter((session) => !session.archived);
        this.filteredSessions = [...this.sessions];
        this.loadReservedSessions();
      },
      (err) => {
        console.error('Erreur lors du chargement des sessions', err);
      }
    );
  }

  getProfilePictureUrl(session: Session): string {
    return session.profilePicture
      ? `data:image/jpeg;base64,${session.profilePicture}`
      : 'assets/images/default-session.jpg';
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getFormattedTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  showLocationOnMap(location: string): void {
    if (!location || !this.mapInitialized) return;

    const [lat, lng] = location.split(',').map(Number);
    this.showMapModal = true;

    setTimeout(() => {
      this.destroyMap();

      this.map = L.map('location-map-modal').setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);

      this.marker = L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup('Lieu de la session')
        .openPopup();
    }, 0);
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.marker = null;
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.destroyMap();
  }

  selectSession(session: Session): void {
    this.selectedSession =
      this.selectedSession?.id === session.id ? null : session;
  }

  // Correction : lancement de Jitsi
  startVideoConference(session: Session, event: Event): void {
    event.stopPropagation();
    this.selectedSession = session;
    this.showJitsiModal = true;

    setTimeout(() => {
      this.initJitsiMeet(session);
    }, 0);
  }

  initJitsiMeet(session: Session): void {
    const domain = 'meet.jit.si'; // domaine public de Jitsi
    const options = {
      roomName: 'MatchMind', // Nom unique pour la salle
      width: '100%',
      height: 600,
      parentNode: document.getElementById('jitsi-container'),
      userInfo: {
        displayName: 'MatchMind',
      },
      configOverwrite: {
        startWithAudioMuted: true, // Démarrer avec le son coupé
        startWithVideoMuted: true, // Démarrer avec la vidéo coupée
        disableInviteFunctions: true, // Désactive la possibilité d'inviter des inconnus
        requireDisplayName: true, // Nécessite un nom d'affichage pour les participants
        enableLobby: true, // Activer le lobby (zone d'attente) où vous devez accepter chaque participant avant qu'il ne rejoigne
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        filmStripOnly: false,
        APP_NAME: 'My Private Meet', // Nom de votre application
        DEFAULT_LOGO_URL: 'url-to-your-logo',
        DISABLE_AUDIO_LEVEL_COLORING: true,
      },
    };

    this.jitsiApi = new JitsiMeetExternalAPI(domain, options);
  }

  destroyJitsi(): void {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }
  }

  closeJitsiModal(): void {
    this.showJitsiModal = false;
    this.destroyJitsi();
  }

  searchSessions(): void {
    if (!this.searchTerm) {
      this.filteredSessions = [...this.sessions];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredSessions = this.sessions.filter(
      (session) =>
        session.nom.toLowerCase().includes(term) ||
        session.description.toLowerCase().includes(term) ||
        (session.speakerName &&
          session.speakerName.toLowerCase().includes(term)) ||
        (session.room && session.room.toLowerCase().includes(term))
    );
  }

  toggleChatbot() {
    this.chatbotVisible = !this.chatbotVisible;
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

        // if (userReservation) {
        // expiredSessionTitles.push(session.title);
        // }
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

  addToReserved(session: Session): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert('You must be logged in to reserve a session.');
      return;
    }

    // Ensure reservations is initialized
    session.reservations = session.reservations || [];

    const alreadyReserved = session.reservations.some(
      (r) => r.userId === userId
    );
    if (alreadyReserved) {
      alert('You have already reserved this session!');
      return;
    }

    const newReservation: Reservation = {
      id: Date.now(),
      userId,
      createdAt: new Date(),
    };

    session.reservations.push(newReservation);

    if (!this.reservedSessions.find((s) => s.id === session.id)) {
      this.reservedSessions.push(session);
    }

    this.saveReservedSessions();
    alert(`${session.nom} has been reserved successfully!`);
  }

  

  private saveReservedSessions(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const userReserved = this.sessions.filter((session) =>
      session.reservations.some((r) => r.userId === userId)
    );

    localStorage.setItem('reservedSessions', JSON.stringify(userReserved));
  }
}
