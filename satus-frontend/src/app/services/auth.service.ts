import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth/login'; //Confg Prox

constructor(private http: HttpClient) {}

login(credentials: any) {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
    tap(res => {
        // Guardar el Token y el Rol que vienen del Backend
        localStorage.setItem('satus_token', res.access_token);
        localStorage.setItem('user_role', res.role); 
    })
    );
}

getRole() {
    return localStorage.getItem('user_role') || 'GUEST';
}

logout() {
    localStorage.clear();
}
}
