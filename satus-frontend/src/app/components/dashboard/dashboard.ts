import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionsService } from '../../services/detections.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, PieController, ArcElement, Tooltip, Legend, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { RouterModule } from '@angular/router';

// REGISTRO GLOBAL DE MOTORES
Chart.register(PieController, ArcElement, Tooltip, Legend);

declare const chrome: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  detections: any[] = [];
  loading = true;
  userRole: string = 'GUEST';
  userName: string = 'INVITADO';

  // CONTADOR AMENAZAS 
  neutralizedCount: number = 0;

  // VARIABLES PARA EL RADAR
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  currentPage: number = 1;
  pageSize: number = 3;
  filter: string = 'ALL';

  @ViewChild('bgVideo') videoRef!: ElementRef<HTMLVideoElement>;

  // 1. INYECTAMOS el detector de cambios en el constructor
  constructor(
    private detectionsService: DetectionsService,
    private cd: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getRole();
    this.userName = this.authService.getUsername();
    console.log(`--- [NODO_DASHBOARD] RANGO DETECTADO: ${this.userRole} ---`);

    // --- CONFIG DEL RADAR (filtrado & busqeuda) ---
    this.searchSubject.pipe(
      debounceTime(400), // Espera 400ms tras dejar de escribir
      distinctUntilChanged() // Solo busca si el texto cambió
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1; // Volvemos al Sector 1 al buscar
      this.loadHistory();
    });

    window.postMessage({
      source: 'SATUS_DASHBOARD',
      action: "SYNC_AUTH",
      token: localStorage.getItem('satusToken'),
      user: { username: this.userName, role: this.userRole }
    }, "*");

    /* Forzar a la extensión a recibir los datos
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage({
          action: "SYNC_AUTH",
          token: localStorage.getItem('satusToken'),
          user: { username: this.userName, role: this.userRole }
        });
      } catch (e) {
        console.log("ℹ️ Conexión directa no disponible, usando túnel PostMessage.");
      }
    }*/

    setTimeout(() => {
      this.userRole = this.authService.getRole();
      this.cd.detectChanges();
      this.loadHistory();
    }, 800);
  }

  //Metodo RADAR 
  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  setFilter(type: string) {
    this.filter = type;
    this.currentPage = 1;
    this.loadHistory();
  }

  formatReport(text: string): string {
    if (!text) return '';

    return text
      // 1. Limpieza de negritas de IA (**) y separadores (==)
      .replace(/\*\*/g, '')
      .replace(/==+/g, '')

      // 2. Encabezados 
      .replace(/Advertencia:/gi, '<br><span class="text-satus-bronce font-bold tracking-widest"> ⚠️ [ ADVERTENCIA ]</span><br>')
      .replace(/Análisis:/gi, '<br><span class="text-satus-report font-bold tracking-widest"> 📡 ANÁLISIS </span><br>')
      .replace(/Conclusi(?:ón|ones):/gi, '<br><span class="text-satus-report font-bold tracking-widest"> 📋 CONCLUSIÓN </span><br>')
      .replace(/DATOS TÉCNICOS:/gi, '<br><span class="text-white/50 border-b border-white/10 block mb-1">■ DATOS TÉCNICOS</span>')
      .replace(/Recomendaci(?:ón|ones):/gi, '<br><span class="text-satus-report font-bold tracking-widest"> A Considerar... </span><br>')

      // 3. Formateo de Listas y URL
      .replace(/URL:/gi, '<br><span class="opacity-40">>> TARGET:</span>')
      .replace(/\* /g, '<br>&nbsp;&nbsp;<span class="text-satus-neon">↳</span> ')
      .trim();
  }

  ngAfterViewInit() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.log("Esperando interacción para iniciar video...");
        window.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 15, 15, 0.9)',
        titleFont: { family: 'monospace', size: 10 },
        bodyFont: { family: 'monospace', size: 10 },
        borderColor: '#c09e2fbe',
        borderWidth: 1
      }
    },
  };

  public pieChartData: any = {
    labels: ['CRÍTICOS', 'SEGUROS'],
    datasets: [{
      data: [0, 0],

      backgroundColor: [
        'rgba(255, 68, 68, 0.38)',
        'rgba(126, 192, 65, 0.52)'
      ],
      // Borde neón 
      borderColor: 'transparent',
      borderWidth: 0,
      //cutout: '50%',
      hoverOffset: 15,
      spacing: 12,
      offset: 18,
    }]
  };

  public pieChartType: ChartType = 'doughnut';

  loadHistory() {

    this.loading = true;

    this.detectionsService.getHistory(
      this.currentPage,
      this.pageSize,
      this.searchQuery,
      this.filter
    ).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.detections = data.map((item: any) => ({
            ...item,
            message: item.message ? item.message.replace(/\*\*/g, '') : 'Sin reporte disponible',
            expanded: false // controla el "Ver más"
          }));

          const conteoMotores: { [key: string]: number } = {};
          let totalDeteccionesMotores = 0;

          this.detections.forEach(scan => {
            // Revisamos si el registro tiene el informe de motores de VirusTotal
            if (scan.details && scan.details.lastAnalysis) {
              const motores = scan.details.lastAnalysis || scan.details.last_analysis_results;

              // Recorre cada antivirus (Kaspersky, Avast, etc.)
              Object.keys(motores).forEach(nombreMotor => {
                // Si el AV marca('malicious')
                if (motores[nombreMotor].result === 'malicious' || motores[nombreMotor].category === 'malicious') {
                  conteoMotores[nombreMotor] = (conteoMotores[nombreMotor] || 0) + 1;
                  totalDeteccionesMotores++;
                }
              });
            }
          });

          // 3. SELECCIÓN DE DATOS 
          let labelsGrafico: string[] = [];
          let datosGrafico: number[] = [];
          let coloresGrafico: string[] = [];

          if (totalDeteccionesMotores > 0) {

            labelsGrafico = Object.keys(conteoMotores);
            datosGrafico = Object.values(conteoMotores);

            // Generamos una paleta de colores neón variantes (rojos, naranjas, púrpuras) para look PRO
            coloresGrafico = labelsGrafico.map((_, index) => {
              const tonos = [
                'rgba(255, 68, 68, 0.95)',  // Rojo Alerta
                'rgba(255, 136, 0, 0.95)',  // Naranja Crítico
                'rgba(255, 0, 128, 0.95)',  // Rosa Cyber
                'rgba(186, 85, 211, 0.95)'  // Púrpura Táctico
              ];
              return tonos[index % tonos.length];
            });
          } else {
            // Si el sector está limpio (0 amenazas), el escudo cian ocupa el 100%
            labelsGrafico = ['SISTEMA INTACTO'];
            datosGrafico = [100];
            coloresGrafico = ['rgba(0, 242, 255, 0.95)']; // Cian Neón de Seguridad
          }

          this.neutralizedCount = this.detections.filter(d => d.riskLevel === 'ALTO').length;

          // 🚀 RE-INSTANCIACIÓN REACTIVA DEL ANILLO TÁCTICO
          this.pieChartData = {
            labels: labelsGrafico,
            datasets: [{
              data: datosGrafico,
              backgroundColor: coloresGrafico,
              borderColor: 'transparent',
              borderWidth: 0,
              cutout: '10%', // Sella el centro a un pin mínimo como pidió
              spacing: totalDeteccionesMotores > 0 ? 6 : 0, // Separación modular si hay cortes
              offset: totalDeteccionesMotores > 0 ? 12 : 0 // Gajos desprendidos del centro
            }]
          };
        }

        this.loading = false;
        this.cd.detectChanges(); // Desbloqueo seguro lineal
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  nextPage() {
    this.currentPage++;
    this.loadHistory();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadHistory();
    }
  }

  // Truncar el texto (35-40 palabras)
  getShortMessage(text: string): string {
    const words = text.split(' ');
    if (words.length <= 40) return text;
    return words.slice(0, 40).join(' ') + '...';
  }

  calculateIntegrity(): number {
    if (this.detections.length === 0) return 100;
    // Contamos ALTOS ignorando espacios o mayúsculas rebeldes
    const threats = this.detections.filter(d =>
      d.riskLevel?.trim().toUpperCase() === 'ALTO'
    ).length;

    const score = 100 - (threats * 10);
    return score < 5 ? 5 : score;
  }

  onLogout() {
    if (confirm("¿TERMINAR SESIÓN Y CERRAR VÍNCULO?")) {
      // Avisa a la extensión antes de borrar todo
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        window.postMessage({
          source: 'SATUS_DASHBOARD',
          action: "SYNC_AUTH",
          token: "GUEST_TOKEN",
          user: { username: "INVITADO", role: "GUEST" }
        }, "*");
      }

      // Hacer el borrado local
      this.authService.logout();
      this.userRole = 'GUEST'; // Actualización visual inmediata
      this.userName = 'INVITADO';
      this.cd.detectChanges();

      // Redirigir al login 
      // this.router.navigate(['/login']);
    }
  }
}
