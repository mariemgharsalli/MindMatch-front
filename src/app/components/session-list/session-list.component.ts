import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-session-list',
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css']
})
export class SessionListComponent {

  competitions = [
    {
      id: 1,
      name: 'ffff',
      description: 'Compétition de danse urbaine',
      deadline: '10 avr. 2025',
      hasScore: true,
      participants: '1,111,100',
      hasCourseImage: true
    },
    {
      id: 2,
      name: 'Nouvelle Compétition',
      description: 'Compétition de danse classique',
      deadline: '17 avr. 2025',
      hasScore: false,
      participants: '850,000',
      hasCourseImage: true
    }
  ];

  // Fonction vide pour l'action du bouton
  openAddDialog() {
    console.log('Bouton cliqué - Ajouter une compétition');
  }
}