import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionsService {
  private apiUrl = '/api/detections'; // proxy previamente config
  public currentModel = 'LLAMA 3.1 8B INSTANT'; 
  
  constructor(private http: HttpClient) {}

  // historial del usuario
  getHistory() {
  const token = localStorage.getItem('satusToken'); 
  return this.http.get<any[]>('/api/detections', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
}

  // Escaneo desde el Dashboard
  analyzeUrl(url: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan`, { url });
  }
}
