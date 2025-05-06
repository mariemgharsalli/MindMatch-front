import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SessionService } from 'src/app/services/session.service';
import * as L from 'leaflet';
import { faArchive, faTrash, faEdit, faExpand, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Session } from 'src/app/_models/Session';
declare var JitsiMeetExternalAPI: any; // déclaration pour Jitsi


@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => *', [
        style({
          transform: 'translateX(-20px)',
          opacity: 0
        }),
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in', style({
          transform: 'translateX(20px)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class SessionListComponent implements OnInit, OnDestroy, AfterViewInit {
  // Font Awesome icons
  faArchive = faArchive;
  faTrash = faTrash;
  faEdit = faEdit;
  faExpand = faExpand;
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;


  sessions: any[] = [];
  archivedSessions: any[] = [];
  sessionForm: FormGroup;
  currentSessionId: number | null = null;
  searchQuery = '';
  showAddModal = false;
  selectedProfileFile: File | null = null;
  showMapModal = false;
  showArchived = false;
  isLoading = true;
  activeTab: 'active' | 'archived' = 'active';
  showMeetingModal = false;
  jitsiApi: any = null;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'warning' | 'error' = 'success';
  
  
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private largeMap: L.Map | null = null;
  private largeMapMarker: L.Marker | null = null;

  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('jitsiContainer', { static: false }) jitsiContainer!: ElementRef;

  constructor(private sessionService: SessionService, private fb: FormBuilder) {
    this.sessionForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.maxLength(500)],
      date: ['', Validators.required],
      expirationDate: ['', Validators.required],
      salle: ['', Validators.required],
      prix: [0, [Validators.required, Validators.min(0)]],
      niveau: ['', Validators.required],
      location: ['', Validators.required],
      speakerName: ['', Validators.required],
      speakerEmail: ['', [Validators.required, Validators.email]],
      isArchived: [false],
      meetingRoom: [''],
      meetingPassword: ['']
    });

    this.fixLeafletIcons();
  }



  generateMeeting(): void {
    const roomName = `session-${Math.random().toString(36).substring(2, 9)}`;
    const password = Math.random().toString(36).substring(2, 8);
    
    this.sessionForm.patchValue({
      meetingRoom: roomName,
      meetingPassword: password
    });
  }

//   startMeeting(roomName: string, password: string): void {
//     this.showMeetingModal = true;
    
//     setTimeout(() => {
//       const domain = 'meet.jit.si';
//       const options = {
//         roomName: roomName,
//         width: '100%',
//         height: '100%',
//         parentNode: this.jitsiContainer.nativeElement,
//         configOverwrite: {
//           startWithAudioMuted: true,
//           startWithVideoMuted: true,
//           password: password
//         },
//         interfaceConfigOverwrite: {
//           SHOW_JITSI_WATERMARK: false,
//           SHOW_WATERMARK_FOR_GUESTS: false
//         },
//         userInfo: {
//           displayName: this.sessionForm.value.speakerName || 'Organizer',
//           email: this.sessionForm.value.speakerEmail || ''
//         }
//       };

//       this.jitsiApi = new JitsiMeetExternalAPI(domain, options);
//     }, 100);
//   }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  }

  closeMeeting(): void {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
      this.jitsiApi = null;
    }
    this.showMeetingModal = false;
  }
  

  ngOnDestroy(): void {
    if (this.jitsiApi) {
      this.jitsiApi.dispose();
    }
    this.destroyMap();
    this.destroyLargeMap();
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  ngOnInit(): void {
    this.loadSessions();
  }

  ngAfterViewInit(): void {
    if (this.showAddModal) {
      this.initMap();
    }
  }

  private fixLeafletIcons() {
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getAllSessions().subscribe({
      next: (data) => {
        this.sessions = data.filter(s => !s.archived);
        this.archivedSessions = data.filter(s => s.archived);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading sessions', err);
        this.isLoading = false;
      }
    });
  }

  getMapPreview(location: string): string {
    if (!location || location === 'N/A') return '';
  
    try {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lng)) return '';
      
      return `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=200&height=100&center=lonlat:${lng},${lat}&zoom=14&marker=lonlat:${lng},${lat};color:%23ff0000;size:small&apiKey=YOUR_GEOAPIFY_KEY`;
    } catch (e) {
      console.error('Error generating map preview:', e);
      return '';
    }
  }

  showLocationOnMap(location: string): void {
    if (!location) return;
    
    const [lat, lng] = location.split(',').map(Number);
    this.showMapModal = true;
    
    setTimeout(() => {
      if (!this.largeMap) {
        this.initLargeMap(lat, lng);
      } else {
        this.largeMap.setView([lat, lng], 15);
        if (this.largeMapMarker) {
          this.largeMapMarker.setLatLng([lat, lng]);
        } else {
          this.largeMapMarker = L.marker([lat, lng]).addTo(this.largeMap);
        }
      }
    }, 100);
  }

  openAddSessionModal(): void {
    this.resetForm();
    this.showAddModal = true;
    setTimeout(() => this.initMap(), 100);
  }

  openEditSessionModal(session: any): void {
    this.currentSessionId = session.id;
    this.sessionForm.patchValue({
      nom: session.nom,
      description: session.description,
      date: new Date(session.date).toISOString().split('T')[0],
      expirationDate: new Date(session.expirationDate).toISOString().split('T')[0],
      salle: session.salle,
      prix: session.prix,
      niveau: session.niveau,
      location: session.location,
      speakerName: session.speakerName,
      speakerEmail: session.speakerEmail,
      isArchived: session.isArchived
    });

    this.showAddModal = true;
    setTimeout(() => {
      this.initMap();
      if (session.location) {
        const [lat, lng] = session.location.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          this.updateMarkerPosition({ lat, lng });
          this.map?.setView([lat, lng], 13);
        }
      }
    }, 100);
  }

  private initMap(): void {
    this.destroyMap();

    setTimeout(() => {
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      this.map = L.map('map').setView([36.8065, 10.1815], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.updateMarkerPosition(e.latlng);
        this.updateFormLocation(e.latlng);
      });

      setTimeout(() => {
        this.map?.invalidateSize();
        if (this.sessionForm.value.location) {
          const [lat, lng] = this.sessionForm.value.location.split(',').map(Number);
          if (!isNaN(lat) && !isNaN(lng)) {
            this.updateMarkerPosition({ lat, lng });
            this.map?.setView([lat, lng], 13);
          }
        }
      }, 100);
    }, 100);
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.marker = null;
  }

  addSession(): void {
    if (this.sessionForm.valid) {
        const sessionData = this.sessionForm.value;
        
        // Make sure we're using the correct ID
        const operation = this.currentSessionId
            ? this.sessionService.updateSession(this.currentSessionId, sessionData)
            : this.sessionService.addSession(sessionData);

        operation.subscribe({
            next: (res) => {
                if (this.selectedProfileFile && res.id) {
                    this.saveImage(res.id);
                }
                this.handleAfterSave();
                
                // Show success notification
                this.notificationMessage = this.currentSessionId 
                    ? 'Session updated successfully' 
                    : 'Session created successfully';
                this.notificationType = 'success';
                this.showNotification = true;
                setTimeout(() => this.hideNotification(), 3000);
            },
            error: (err) => {
                console.error('Error saving session', err);
                this.notificationMessage = 'Error saving session';
                this.notificationType = 'error';
                this.showNotification = true;
                setTimeout(() => this.hideNotification(), 5000);
            }
        });
    }
}

  saveImage(sessionId: number): void {
    if (this.selectedProfileFile) {
      const formData = new FormData();
      formData.append('profilePicture', this.selectedProfileFile);
      this.sessionService.uploadUserImages(formData, sessionId).subscribe();
    }
  }

  fileChange(event: any): void {
    this.selectedProfileFile = event.target.files[0];
  }

  deleteSession(id: number): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(id).subscribe({
        next: () => this.loadSessions(),
        error: (err) => console.error('Delete error', err)
      });
    }
  }

  archiveSession(id: number): void {
    this.sessionService.archiveSession(id).subscribe({
      next: () => {
        this.loadSessions();
        this.showArchiveNotification(); // Afficher la notification
      },
      error: (err) => {
        console.error('Archive error', err);
        this.notificationMessage = 'Erreur lors de l\'archivage de la session';
        this.notificationType = 'error';
        this.showNotification = true;
        setTimeout(() => this.hideNotification(), 5000);
      }
    });
  }

  showArchiveNotification() {
    this.notificationMessage = 'Cette session sera automatiquement supprimée après 1 heure.';
    this.notificationType = 'warning';
    this.showNotification = true;
    
    // Masquer automatiquement après 5 secondes
    setTimeout(() => {
      this.hideNotification();
    }, 5000);
  }
  
  hideNotification() {
    this.showNotification = false;
  }



  unarchiveSession(id: number): void {
    this.sessionService.unarchiveSession(id).subscribe({
      next: () => {
        this.loadSessions();
        this.notificationMessage = 'Session désarchivée avec succès';
        this.notificationType = 'success';
        this.showNotification = true;
        setTimeout(() => this.hideNotification(), 3000);
      },
      error: (err) => {
        console.error('Unarchive error', err);
        this.notificationMessage = 'Erreur lors de la désarchivage de la session';
        this.notificationType = 'error';
        this.showNotification = true;
        setTimeout(() => this.hideNotification(), 5000);
      }
    });
  }

  searchSession(): void {
    if (this.searchQuery.trim()) {
      const targetArray = this.activeTab === 'active' ? this.sessions : this.archivedSessions;
      const filtered = targetArray.filter(session =>
        session.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        session.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        session.speakerName.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      
      if (this.activeTab === 'active') {
        this.sessions = filtered;
      } else {
        this.archivedSessions = filtered;
      }
    } else {
      this.loadSessions();
    }
  }

  closeModal(): void {
    this.showAddModal = false;
    this.destroyMap();
  }

  resetForm(): void {
    this.sessionForm.reset({
      prix: 0,
      isArchived: false
    });
    this.currentSessionId = null;
    this.selectedProfileFile = null;
  }

  handleAfterSave(): void {
    this.loadSessions();
    this.showAddModal = false;
    this.resetForm();
    this.destroyMap();
  }

  private updateMarkerPosition(latLng: { lat: number; lng: number }): void {
    if (this.marker) {
      this.marker.setLatLng([latLng.lat, latLng.lng]);
    } else {
      this.marker = L.marker([latLng.lat, latLng.lng]).addTo(this.map!);
    }
  }

  private updateFormLocation(latLng: { lat: number; lng: number }): void {
    this.sessionForm.patchValue({ 
      location: `${latLng.lat.toFixed(6)},${latLng.lng.toFixed(6)}` 
    });
  }

  openMapModal(): void {
    this.showMapModal = true;
    setTimeout(() => {
      if (this.sessionForm.value.location) {
        const [lat, lng] = this.sessionForm.value.location.split(',').map(Number);
        this.initLargeMap(lat, lng);
      } else {
        this.initLargeMap(36.8065, 10.1815);
      }
    }, 100);
  }

  closeMapModal(): void {
    this.showMapModal = false;
    this.destroyLargeMap();
  }

  confirmLocation(): void {
    if (this.largeMapMarker) {
      const latLng = this.largeMapMarker.getLatLng();
      this.sessionForm.patchValue({
        location: `${latLng.lat.toFixed(6)},${latLng.lng.toFixed(6)}`
      });
    }
    this.closeMapModal();
  }

  private initLargeMap(lat: number, lng: number): void {
    this.destroyLargeMap();

    setTimeout(() => {
      const largeMapContainer = document.getElementById('large-map');
      if (!largeMapContainer) return;

      this.largeMap = L.map(largeMapContainer).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.largeMap);

      this.largeMapMarker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.largeMap);

      this.largeMap.on('click', (e: L.LeafletMouseEvent) => {
        this.largeMapMarker?.setLatLng(e.latlng);
      });

      setTimeout(() => {
        this.largeMap?.invalidateSize();
      }, 0);
    }, 0);
  }

  private destroyLargeMap(): void {
    if (this.largeMap) {
      this.largeMap.remove();
      this.largeMap = null;
    }
    this.largeMapMarker = null;
  }

  scrollTable(direction: 'left' | 'right') {
    const container = this.scrollContainer.nativeElement;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  switchTab(tab: 'active' | 'archived'): void {
    this.activeTab = tab;
    this.searchQuery = '';
    this.loadSessions();
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 100);
    }
    if (this.largeMap) {
      setTimeout(() => this.largeMap?.invalidateSize(), 100);
    }
  }

    // Correction : lancement de Jitsi
    showJitsiModal = false;

    startVideoConference(session: Session, event: Event): void {
      event.stopPropagation();
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
          displayName: 'MatchMind'
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
        }
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

  
}