import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetectionsService {
  private apiUrl = '/api/detections'; // proxy previamente config

  constructor(private http: HttpClient) {}

  // historial del usuario
  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Escaneo desde el Dashboard
  analyzeUrl(url: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/scan`, { url });
  }
}
