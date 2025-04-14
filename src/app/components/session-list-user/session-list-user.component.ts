import { Component } from '@angular/core';

interface Session {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  date: Date;
  imageUrl: string;
  location: string;
  price: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

@Component({
  selector: 'app-session-list-user',
  templateUrl: './session-list-user.component.html',
  styleUrls: ['./session-list-user.component.css']
})
export class SessionListUserComponent {
  selectedSession: Session | null = null;
  searchTerm = '';

  sessions: Session[] = [
    {
      id: 1,
      title: 'Atelier Angular Avancé',
      description: 'Maîtrisez les concepts avancés d\'Angular',
      fullDescription: 'Cette session intensive couvre les sujets avancés d\'Angular comme les performances, les tests unitaires et les bonnes pratiques d\'architecture.',
      date: new Date(2023, 10, 15),
      imageUrl: 'https://via.placeholder.com/400x225/3a7bd5/ffffff?text=Angular',
      location: 'Espace Coworking, Tunis',
      price: 299,
      level: 'ADVANCED'
    },
    {
      id: 2,
      title: 'Introduction à React',
      description: 'Découvrez les bases de React',
      fullDescription: 'Apprenez les fondamentaux de React à travers des exercices pratiques et la construction d\'une petite application.',
      date: new Date(2023, 10, 20),
      imageUrl: 'https://via.placeholder.com/400x225/61dbfb/ffffff?text=React',
      location: 'Centre de Formation, Sousse',
      price: 199,
      level: 'BEGINNER'
    },
    {
      id: 3,
      title: 'Node.js et Express',
      description: 'Créez des APIs robustes avec Node.js',
      fullDescription: 'Développez des APIs modernes en utilisant Node.js, Express et les meilleures pratiques du marché.',
      date: new Date(2023, 11, 5),
      imageUrl: 'https://via.placeholder.com/400x225/68a063/ffffff?text=Node.js',
      location: 'Technopole El Ghazala',
      price: 249,
      level: 'INTERMEDIATE'
    },
    {
      id: 4,
      title: 'UI/UX Design',
      description: 'Principes fondamentaux du design',
      fullDescription: 'Acquérez les compétences essentielles pour créer des interfaces utilisateur intuitives et esthétiques.',
      date: new Date(2023, 11, 12),
      imageUrl: 'https://via.placeholder.com/400x225/a259ff/ffffff?text=UI/UX',
      location: 'Espace Créatif, Tunis',
      price: 179,
      level: 'BEGINNER'
    },
    {
      id: 5,
      title: 'Data Science avec Python',
      description: 'Introduction à l\'analyse de données',
      fullDescription: 'Découvrez les bases de la data science avec Python, Pandas et les visualisations de données.',
      date: new Date(2023, 11, 18),
      imageUrl: 'https://via.placeholder.com/400x225/3776ab/ffffff?text=Python',
      location: 'Institut Technologique, Sfax',
      price: 349,
      level: 'INTERMEDIATE'
    },
    {
      id: 6,
      title: 'DevOps Essentials',
      description: 'Les bases des pratiques DevOps',
      fullDescription: 'Apprenez les principes DevOps, CI/CD, Docker et Kubernetes pour moderniser vos déploiements.',
      date: new Date(2024, 0, 8),
      imageUrl: 'https://via.placeholder.com/400x225/2496ed/ffffff?text=DevOps',
      location: 'Centre de Conférences, Tunis',
      price: 399,
      level: 'ADVANCED'
    }
  ];

  selectSession(session: Session): void {
    this.selectedSession = this.selectedSession?.id === session.id ? null : session;
  }

  get filteredSessions() {
    return this.sessions.filter(session =>
      session.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}