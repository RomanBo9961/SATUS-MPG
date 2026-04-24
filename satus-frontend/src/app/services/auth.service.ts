import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

declare const chrome: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = '/api/auth/login'; //Confg Prox

    constructor(private http: HttpClient) { }

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

    getRole() {
        return localStorage.getItem('user_role') || 'GUEST';
    }

    logout() {
        localStorage.clear();
    }
}
