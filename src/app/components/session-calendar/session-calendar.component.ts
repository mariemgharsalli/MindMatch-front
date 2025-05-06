import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Session } from '../../_models/Session';

@Component({
  selector: 'app-session-calendar',
  templateUrl: './session-calendar.component.html',
  styleUrls: ['./session-calendar.component.css']
})
export class SessionCalendarComponent implements OnInit {
  @Input() sessions: Session[] = [];
  @Output() dateSelected = new EventEmitter<string>();

  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  monthNames: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  dayNames: string[] = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  weeks: any[] = [];
  daysWithSessions: Set<string> = new Set();
  isOpen: boolean = false;
  selectedDay: number | null = null;

  ngOnInit(): void {
    this.generateCalendar();
    this.markDaysWithSessions();
  }

  ngOnChanges(): void {
    this.markDaysWithSessions();
  }

  toggleCalendar(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.generateCalendar();
      this.markDaysWithSessions();
    }
  }

  generateCalendar(): void {
    this.weeks = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push({ day: null });
        } else if (date > daysInMonth) {
          week.push({ day: null });
        } else {
          const dayDate = new Date(this.currentYear, this.currentMonth, date);
          const dateString = dayDate.toISOString().split('T')[0];
          const sessionCount = this.getSessionsForDay(date).length;
          
          week.push({
            day: date,
            date: dateString,
            hasSession: sessionCount > 0,
            sessionCount: sessionCount,
            isToday: this.isToday(dayDate),
            isSelected: this.selectedDay === date
          });
          date++;
        }
      }
      this.weeks.push(week);
      if (date > daysInMonth) break;
    }
  }

  markDaysWithSessions(): void {
    this.daysWithSessions = new Set();
    this.sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      // Ajuste le mois et l'année en fonction du fuseau horaire
      const adjustedDate = new Date(sessionDate.getTime() + sessionDate.getTimezoneOffset() * 60000);
      
      if (adjustedDate.getMonth() === this.currentMonth && 
          adjustedDate.getFullYear() === this.currentYear) {
        const day = adjustedDate.getDate();
        this.daysWithSessions.add(day.toString());
      }
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  prevMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.selectedDay = null;
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.selectedDay = null;
    this.generateCalendar();
  }

  selectDay(day: any): void {
    if (!day.day) return;
    
    this.selectedDay = day.day;
    // Envoie la date au format YYYY-MM-DD sans heure
    const selectedDate = new Date(this.currentYear, this.currentMonth, day.day);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    this.dateSelected.emit(formattedDate);
  }

  getMonthYearString(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getSessionsForDay(day: number): Session[] {
    // Crée une date en milieu de journée pour éviter les problèmes de fuseau horaire
    const date = new Date(this.currentYear, this.currentMonth, day, 12, 0, 0);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    return this.sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= dateStart && sessionDate <= dateEnd;
    });
  }
}