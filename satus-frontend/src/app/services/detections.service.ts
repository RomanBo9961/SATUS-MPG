import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionsService {
  private apiUrl = '/api/detections'; // proxy previamente config
  public currentModel = 'LLAMA 3.1 8B INSTANT';

  constructor(private http: HttpClient) { }

  // historial del usuario
  getHistory(page: number = 1, limit: number = 10, search: string = '', risk: string = 'ALL') {
    const token = localStorage.getItem('satusToken');

    // Prepara los parámetros de búsqueda
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search)
      .set('risk', risk);

    // Envia la petición con TOKEN y PARÁMETROS
    return this.http.get<any[]>(this.apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: params // <--- Aquí inyectamos el Radar
    });
  }

  // Escanea desde el Dashboard 
  analyzeUrl(url: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan`, { url });
  }
}
