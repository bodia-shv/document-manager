import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../../models/auth.model';
import { ELocalStorageKeys } from '../../models/local-storage.enum';
import { ProfileService } from '../profile/profile.service';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly profileService: ProfileService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {
    const token = localStorage.getItem(ELocalStorageKeys.AccessToken);
    this.isAuthenticatedSubject.next(!!token);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/v1/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isAuthenticatedSubject.next(true);
      }),
      switchMap(() => this.profileService.getProfileData().pipe(
        take(1),
        tap(() => {
          this.router.navigate(['/documents']);
        }),
        catchError(() => {
          this.logout();
          this.router.navigate(['/login']);
          return of(null);
        })
      )),
      catchError(error => {
        this.notificationService.showError(error.error.message);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.isAuthenticatedSubject.next(false);
    this.profileService.clearUser();
    this.router.navigate(['/sign-in']);
  }

  getToken(): string | null {
    return localStorage.getItem(ELocalStorageKeys.AccessToken);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}