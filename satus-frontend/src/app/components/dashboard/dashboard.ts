import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetectionsService } from '../../services/detections.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, PieController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import { RouterModule } from '@angular/router';

// REGISTRO GLOBAL DE MOTORES
Chart.register(PieController, ArcElement, Tooltip, Legend, LineController, LineElement, PointElement, CategoryScale, LinearScale);

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

  // SENSOR DEL LISTADO AV
  motoresActivos: any[] = [];

  blindajePercentage: number = 100;
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

  public pieChartType: any = 'doughnut';

  public pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 15, 15, 0.9)',
        titleFont: { family: 'monospace', size: 15 },
        bodyFont: { family: 'monospace', size: 15 },
        borderColor: '#c09e2fbe',
        borderWidth: 1
      }
    }
  };

  public pieChartData: any = {
    labels: ['CRÍTICOS', 'SOSPECHOSOS', 'INTEGRIDAD'],
    datasets: [{
      data: [0, 0, 100], // Estado inicial limpio
      backgroundColor: ['rgba(255, 68, 68, 0.95)', 'rgba(255, 136, 0, 0.95)', '#9ba37d'],
      borderColor: 'transparent',
      borderWidth: 0,
      cutout: '15%'
    }]
  };

  // ==========================================
  // PANEL RADIOGRAFICO 
  // ==========================================
  public lineChartType: any = 'line';

  public lineChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(15, 15, 15, 0.95)',
      titleFont: { family: 'monospace', size: 9 },
      bodyFont: { family: 'monospace', size: 9 },
      borderColor: '#ff4444',
      borderWidth: 1
    },
    // REJILLA PUNTEADA
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderDash: [2, 2], // Rejilla punteada vertical [3]
          drawTicks: false
        },
        ticks: {
          color: 'rgba(155, 163, 125, 0.4)',
          font: { family: 'monospace', size: 6 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 5 // Evita que las horas se amontonen toscamente
        }
      },
      y: {
        display: true,
        position: 'right', // Estilo monitor de hospital
        min: 0,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          borderDash: [2, 2], // Rejilla punteada horizontal [3]
          drawTicks: false
        },
        ticks: {
          color: 'rgba(155, 163, 125, 0.4)',
          font: { family: 'monospace', size: 7 },
          stepSize: 5
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: 1.5,
        borderColor: '#9ba37d',
        fill: true,
        backgroundColor: 'rgba(155, 163, 125, 0.03)'
      },
      point: { radius: 3, backgroundColor: '#ff4444', hoverRadius: 6 }
    }
  };

  public lineChartData: any = { labels: [], datasets: [{ data: [] }] };


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

          // Recorre las tarjetas actuales en pantalla 
          this.detections.forEach(scan => {
            const motores = scan.details?.lastAnalysis || scan.details?.last_analysis_results;
            if (scan.details && motores) {
              Object.keys(motores).forEach(nombreMotor => {
                if (motores[nombreMotor].result === 'malicious' || motores[nombreMotor].category === 'malicious') {
                  
                  conteoMotores[nombreMotor] = (conteoMotores[nombreMotor] || 0) + 1;
                  totalDeteccionesMotores++;
                }
              });
            }
          });

          // LISTADO  ordenado de mayor a menor activo
          this.motoresActivos = Object.keys(conteoMotores)
            .map(name => ({ name, count: conteoMotores[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6); // Limita n- de motores diag

          // Cálculos de severidad 
          let criticos = 0;
          let sospechosos = 0;

          this.detections.forEach(scan => {
            const malicious = scan.details?.stats?.malicious || 0;
            const reputation = scan.details?.info?.reputation || 0;
            if (malicious > 3) criticos++;
            else if (malicious > 0 || reputation < 0 || scan.riskLevel === 'ALTO') sospechosos++;
          });

          const totalSectores = this.detections.length;
          const totalPeligros = criticos + sospechosos;
          const porcCritico = totalSectores > 0 ? Math.round((criticos / totalSectores) * 100) : 0;
          const porcSospechoso = totalSectores > 0 ? Math.round((sospechosos / totalSectores) * 100) : 0;
          const porcIntegridad = 100 - (porcCritico + porcSospechoso);

          this.neutralizedCount = totalPeligros;
          this.blindajePercentage = porcIntegridad;

          const tieneCortes = totalPeligros > 0;
          this.pieChartData = {
            labels: ['CRÍTICOS', 'SOSPECHOSOS', 'INTEGRIDAD'],
            datasets: [{
              data: [porcCritico, porcSospechoso, porcIntegridad],
              backgroundColor: ['rgba(255, 68, 68, 0.95)', 'rgba(255, 136, 0, 0.95)', '#97a073'],
              borderColor: 'transparent',
              borderWidth: 0,
              cutout: '10%',
              spacing: tieneCortes ? 4 : 0,
              offset: tieneCortes ? 18 : 0
            }]
          };

          // Clonar e invertir para avanzar en el tiempo (izquierda a derecha)
          const historialCronologico = [...this.detections].reverse();

          this.lineChartData = {
            // Mapear las marcas de tiempo para el Eje X
            labels: historialCronologico.map(d => {
              const date = new Date(d.createdAt);
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }),
            datasets: [{
              label: 'Alertas',
              // Extrae estrictamente el número INDIVIDUAL de virus de cada tarjeta, sin sumar.
              data: historialCronologico.map(d => d.details?.stats?.malicious || (d.riskLevel === 'ALTO' ? 5 : 0))
            }]
          };
        }

        this.loading = false;
        this.cd.detectChanges();
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
    // Contar ALTOS ignorando espacios o mayúsculas rebeldes
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
