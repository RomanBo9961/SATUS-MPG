import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';


declare const chrome: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = '/api/auth/login'; //Confg Prox

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    login(credentials: any) {
        return this.http.post<any>(this.apiUrl, credentials).pipe(
            tap(res => {
                // Guardado en la Web. El content.js se encargará de "ver" esto.
                localStorage.setItem('satusToken', res.access_token);
                localStorage.setItem('user_role', res.role);
                localStorage.setItem('username', res.username);
            })
        );
    }

    register(userData: any) {
        return this.http.post<any>('/api/users/register', userData);
    }

    getUsername() {
        return localStorage.getItem('username') || 'USUARIO';
    }

    getRole() {
        return localStorage.getItem('user_role') || 'GUEST';
    }

    logout() {

        localStorage.clear();

        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({
                action: "SYNC_AUTH",
                token: null,
                user: { username: 'INVITADO', role: 'GUEST' }
            });
        }

        this.router.navigate(['/login']);
    }

    loginWithGoogle(tokenCifrado: string): Observable<any> {
        // envia el JWT en paquete POST  hacia  NestJS
        return this.http.post(`${this.apiUrl}/auth/google`, { token: tokenCifrado }).pipe(
            tap((res: any) => {
                // Al aprobarse desde el búnker, guarda las credenciales
                if (res && res.token) {
                    localStorage.setItem('satusToken', res.token);
                    localStorage.setItem('user_role', res.role || 'PROLicense');
                    localStorage.setItem('username', res.username || 'Analista_Satus');

                    //Avisarle al Centinela 
                    window.dispatchEvent(new Event('storage'));
                }
            })
        );
    }

}
