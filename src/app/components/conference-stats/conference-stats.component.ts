import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-conference-stats',
  templateUrl: './conference-stats.component.html',
  styleUrls: ['./conference-stats.component.css']
})
export class ConferenceStatsComponent implements OnInit {
  private statsData: any[] = [];
  private monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  private monthMap: { [key: string]: number } = {
    'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
    'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11,
    'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
    'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: this.monthNamesEn,
    datasets: [
      { 
        data: new Array(12).fill(0), 
        label: 'Number of conferences',
        backgroundColor: '#2d3e50', // dashboard blue
        borderColor: '#1bb1dc', // dashboard accent
        borderWidth: 2,
        hoverBackgroundColor: '#1bb1dc'
      }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#2d3e50',
          font: { weight: 'bold' }
        },
        grid: {
          color: '#e5e9f2'
        }
      },
      x: {
        ticks: {
          color: '#2d3e50',
          font: { weight: 'bold' }
        },
        grid: {
          color: '#e5e9f2'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#2d3e50',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#1bb1dc',
        borderWidth: 1
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    console.log('Loading conference statistics...');
    this.http.get<any[]>('http://localhost:8088/api/conferences/stats/year')
      .subscribe({
        next: (data) => {
          console.log('Raw stats data from API:', data);
          if (Array.isArray(data)) {
            this.statsData = data;
            console.log('Processed stats data:', this.statsData);
            const monthlyData = new Array(12).fill(0);
            data.forEach(item => {
              const monthIndex = this.getMonthIndex(item.month);
              console.log(`Processing month: ${item.month}, index: ${monthIndex}, count: ${item.conferenceCount}`);
              if (monthIndex !== -1) {
                monthlyData[monthIndex] = Number(item.conferenceCount) || 0;
              }
            });
            console.log('Monthly data array:', monthlyData);
            this.barChartData.labels = this.monthNamesEn;
            this.barChartData.datasets[0].data = monthlyData;
            this.barChartData = {...this.barChartData};
            console.log('Final chart data:', this.barChartData);
          } else {
            console.warn('Received non-array data from API');
            this.initializeDefaultData();
          }
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.initializeDefaultData();
        }
      });
  }

  private getMonthIndex(monthName: string): number {
    if (!monthName) {
      console.warn('Empty month name received');
      return -1;
    }
    const index = this.monthMap[monthName.toLowerCase()] ?? -1;
    console.log(`Month name: ${monthName}, Index: ${index}`);
    return index;
  }

  private initializeDefaultData(): void {
    console.log('Initializing default data');
    this.barChartData.labels = this.monthNamesEn;
    this.barChartData.datasets[0].data = new Array(12).fill(0);
    this.barChartData = {...this.barChartData};
  }

  getTotalConferences(): number {
    const total = this.statsData.reduce((total, item) => total + (Number(item.conferenceCount) || 0), 0);
    console.log('Total conferences calculated:', total);
    return total;
  }

  getMostActiveMonth(): string {
    if (this.statsData.length === 0) {
      console.log('No stats data available');
      return 'N/A';
    }
    const maxItem = this.statsData.reduce((max, item) => 
      (Number(item.conferenceCount) || 0) > (Number(max.conferenceCount) || 0) ? item : max
    );
    const idx = this.getMonthIndex(maxItem.month);
    const result = idx !== -1 ? this.monthNamesEn[idx] : maxItem.month || 'N/A';
    console.log('Most active month:', result);
    return result;
  }

  refreshConferences(): void {
    console.log('Refreshing conference statistics...');
    this.loadStats();
  }
}
