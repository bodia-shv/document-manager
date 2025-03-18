// src/app/core/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // Імпорт HttpParams
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDocument, IDocumentResponse } from '../../models/documents.models';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly notificationService: NotificationService
  ) {}

  getDocuments(
    page: number = 1,
    size: number = 10,
    sort: string = 'name,asc',
    status?: string,
    creatorId?: string,
    creatorEmail?: string
  ): Observable<IDocumentResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (status) {
      params = params.set('status', status);
    }

    if (creatorId) {
      params = params.set('creatorId', creatorId);
    }

    if (creatorEmail) {
      params = params.set('creatorEmail', creatorEmail);
    }

    return this.http.get<IDocumentResponse>(`${this.apiUrl}/api/v1/document`, { params }).pipe(
      catchError((error) => {
        this.notificationService.showError(error?.error?.message);
        return throwError(() => new Error(error?.error?.message));
      })
    );
  }
}