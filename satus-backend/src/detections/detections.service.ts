import { Injectable } from '@nestjs/common';

@Injectable()
export class DetectionsService {
  
  //'Create' => 'analyzeUrl'
  async analyzeUrl(url: string) {
    console.log(`🛡️ SATUS Service procesando: ${url}`);
    
    // Devuelve un objeto de prueba
    return {
      status: "success",
      message: `SATUS ha recibido el link: ${url}. Analizando con IA...`,
      riskLevel: "Calculando..."
    };
  }

}
