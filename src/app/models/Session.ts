import { Reservation } from "./reservation.model";

export interface Session {
    id?: number;
    nom: string;
    description: string;
    date: string; // ou Date selon ce que tu veux manipuler
    expirationDate: string ;
    room?: any; // à définir si tu veux ajouter un sélecteur de salle
    userCompetition?: any[];
    profilePicture?: string ;
    location: string;
    archived: boolean;
    speakerName: string;
    speakerEmail: string;
    prix: number;
    niveau: string
    submissions?: any[]
    archiveDate?: Date;  // Add this for the sc
    reservations: Reservation[];
  }
  