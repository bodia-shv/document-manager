import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUser, IUsersResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<IUser | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  getProfileData(): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/api/v1/user`).pipe(
      tap(response => {
        this.userSubject.next(response);
      })
    );
  }

  get user(): IUser | null {
    return this.userSubject.value;
  }

  clearUser(): void {
    this.userSubject.next(null);
  }

  getUsers(page: number = 1, size: number = 10): Observable<IUsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<IUsersResponse>(`${this.apiUrl}/api/v1/user/users`, { params });
  }
}