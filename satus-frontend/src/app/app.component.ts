import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionsService } from './services/detections.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  detections: any[] = [];
  loading = true;

  constructor(private detectionsService: DetectionsService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.detectionsService.getHistory().subscribe({
      next: (data) => {
        this.detections = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando historial:', err);
        this.loading = false;
      }
    });
  }
}
