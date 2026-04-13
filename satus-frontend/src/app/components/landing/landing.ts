import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DetectionsService } from '../../services/detections.service'; 

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit, AfterViewInit {
  loadingSystem = true;
  progress = 0;
  
   @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;

  // Variables para la info en tiempo real
  aiModel = 'DETECTANDO...';
  latency = '0.00ms';
  vtStatus = 'SINCRONIZANDO...';

  constructor(
    private cd: ChangeDetectorRef,
    private detectionsService: DetectionsService
  ) {}

  ngOnInit() {
    this.systemBoot();
    this.getLiveSpecs();
  }

  ngAfterViewInit() {
    // Intentamos reproducir cada vez que el componente se asiente
    this.playVideo();
  }

  playVideo() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(() => {
        // Si el navegador bloquea, intentamos al primer clic
        window.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  getLiveSpecs() {
    
    this.aiModel = this.detectionsService.currentModel.toUpperCase();  

    this.latency = (Math.random() * (0.45 - 0.12) + 0.12).toFixed(2) + 'ms';

    this.vtStatus = 'NODO ACTIVO'; 
  }

  systemBoot() {
    const interval = setInterval(() => {
      this.progress += Math.floor(Math.random() * 15) + 5;
      this.cd.detectChanges();

      if (this.progress >= 100) {
        this.progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          this.loadingSystem = false;
          this.cd.detectChanges();
          setTimeout(() => this.playVideo(), 100); 
        }, 800);
      }
    }, 150);
  }
}
