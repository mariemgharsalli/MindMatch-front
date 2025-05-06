// session-statistics.component.ts

import { Component, OnInit } from '@angular/core';
import { SubmissionService } from 'src/app/services/submission.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-session-statistics',
  templateUrl: './session-statistics.component.html',
  styleUrls: ['./session-statistics.component.css']
})
export class SessionStatisticsComponent implements OnInit {
  // Données pour les graphiques
  dailyData: any[] = [];
  topSessions: any[] = [];
  
  // Graphique 1: Soumissions par jour
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Submissions Evolution by Day'
      }
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Submissions',
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: true
    }]
  };

  // Graphique 2: Top sessions
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // Barres horizontales
    plugins: {
      title: {
        display: true,
        text: 'Top 10 Most Popular Sessions'
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Submissions',
      backgroundColor: 'rgba(54, 162, 235, 0.7)'
    }]
  };

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics() {
    this.submissionService.getSessionStatistics().subscribe({
      next: (data) => {
        this.dailyData = data.dailyData;
        this.topSessions = data.topSessions;
        
        // Mise à jour des graphiques
        this.updateLineChart();
        this.updateBarChart();
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
      }
    });
  }

  private updateLineChart() {
    this.lineChartData = {
      labels: this.dailyData.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [{
        data: this.dailyData.map(d => d.totalSubmissions),
        label: 'Submissions',
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }]
    };
  }

  private updateBarChart() {
    this.barChartData = {
      labels: this.topSessions.map(s => s.sessionName),
      datasets: [{
        data: this.topSessions.map(s => s.totalSubmissions),
        label: 'Submissions',
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    };
  }
}