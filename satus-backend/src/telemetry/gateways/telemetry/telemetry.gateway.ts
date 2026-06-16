import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Habilitamos la antena en el puerto nativo de la app con CORS para desarrollo
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {

  // Instancia el servidor global de Socket.io
  @WebSocketServer()
  server!: Server;

  // Disparador cuando un SuperAdmin entra a la consola
  handleConnection(client: Socket) {
    console.log(`📡 [WEBSOCKET]: Analista conectado al flujo de telemetría. ID Sesión: [${client.id}]`);
  }

  // Disparador cuando cierran la pestaña de SATUS
  handleDisconnect(client: Socket) {
    console.log(`🔌 [WEBSOCKET]: Analista desconectado del perímetro. ID Sesión: [${client.id}]`);
  }

  // Disparador Central de Logs
  broadcastSystemLog(logPayload: { type: string; message: string; operator: string }) {
    const timestamp = new Date().toLocaleTimeString();

    const structuredLog = {
      time: timestamp,
      type: logPayload.type,       // 'SECURITY_ALERT', 'IA_HEURISTIC', 'STRIPE_BANK'
      message: logPayload.message,
      operator: logPayload.operator
    };

    // Emite el dardo por el canal privado de auditoría hacia Angular
    this.server.emit('[SATUS_AUDIT_STREAM]', structuredLog);
  }
}