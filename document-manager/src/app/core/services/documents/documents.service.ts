import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EDocumentStatus, IDocument, IDocumentResponse } from '../../models/documents.models';
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

  addDocument(name: string, file: File, status: string): Observable<IDocument> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    formData.append('status', status);
  
    return this.http.post<IDocument>(`${this.apiUrl}/api/v1/document`, formData)
  }

  updateDocument(id: string, name: string): Observable<IDocument> {
    const body = { name };

    return this.http.patch<IDocument>(`${this.apiUrl}/api/v1/document/${id}`, body);
  }

  getDocument(id: string): Observable<IDocument> {
    return this.http.get<IDocument>(`${this.apiUrl}/api/v1/document/${id}`);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/v1/document/${id}`);
  }

  sendToReviewDocument(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/v1/document/${id}/send-to-review`, {});
  }

  revokeDocument(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/v1/document/${id}/revoke-review`, {});
  }

  changeDocumentStatus(id: string, status: EDocumentStatus): Observable<any> {
    const body = { status };
    return this.http.post(`${this.apiUrl}/api/v1/document/${id}/change-status`, body);
  }
}