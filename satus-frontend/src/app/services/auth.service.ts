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
                // 1. Guardar en la Web
                localStorage.setItem('satusToken', res.access_token);
                localStorage.setItem('user_role', res.role);
                localStorage.setItem('username', res.username);

                // 2. Sincroniza con la Extensión
                if (typeof chrome !== 'undefined' && chrome.runtime) {
                    const extensionId = "oonfllkndhddogibdaahfgeiimfgoeng"; 
                    chrome.runtime.sendMessage(extensionId, {
                        action: "SET_TOKEN",
                        token: res.access_token,
                        user: { username: res.username, role: res.role }
                    });
                }
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
