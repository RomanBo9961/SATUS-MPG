import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private socket!: Socket;
  // Usa Subject para transmitir logs vivos de forma reactiva
  private logStream$ = new Subject<any>();

  constructor() {
    // Inicializamos la conexión al backend
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      autoConnect: false 
    });

    this.socket.on('[SATUS_AUDIT_STREAM]', (nuevoLog: any) => {
      this.logStream$.next(nuevoLog); // Lanza el dardo al stream de Angular
    });
  }

  connectSystem() {
    if (!this.socket.connected) {
      this.socket.connect();
      console.log('📡 [TELEMETRÍA FRONT]: Cable de WebSockets conectado con éxito.');
    }
  }

  disconnectSystem() {
    if (this.socket.connected) {
      this.socket.disconnect();
      console.log('🔌 [TELEMETRÍA FRONT]: Cable de WebSockets cerrado.');
    }
  }

  // Expone el flujo reactivo de logs para que la terminal de la interfaz se suscriba
  getLiveLogs(): Observable<any> {
    return this.logStream$.asObservable();
  }
}
