import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import NutrientViewer from '@nutrient-sdk/viewer';
import { EDocumentStatus, IDocument } from '../../../core/models/documents.models';
import { EUserType } from '../../../core/models/user.model';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { DocumentService } from '../../../core/services/documents/documents.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NOTIF_DURATION } from '../../helpers/_consts';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: 
  [
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTooltipModule, 
    MatToolbarModule, 
    MatDialogActions
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PdfViewerComponent implements OnInit {
  public statuses = EDocumentStatus;
  public userRoles = EUserType;
  public isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      document: IDocument,
      userRole: EUserType;
    },
    private readonly documentService: DocumentService,
    private readonly snackBar: MatSnackBar,
    public readonly dialogRef: MatDialogRef<PdfViewerComponent>,
    public readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      NutrientViewer.load({
        baseUrl:`${location.protocol}//${location.host}/assets/`,
        document: this.data.document.fileUrl,
        container: '#nutrient-container',
      }).then((instance) => {
        (window as any).instance = instance;
      });
    });
  }

  changeStatus(status: EDocumentStatus): void {
    this.isLoading = true;
    this.documentService
      .changeDocumentStatus(this.data.document.id, status)
      .pipe(
        take(1),
        finalize(() => { 
          this.finalizeHanlde();
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Status changed', 'Close', { duration: NOTIF_DURATION });
          this.data.document.status = status;
        },
        error: (error) => {
          this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
        },
      });
  }

  deleteDocument(): void {
    this.isLoading = true;
    this.documentService
      .deleteDocument(this.data.document.id)
      .pipe(
        take(1),
        finalize(() => { 
          this.finalizeHanlde();
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Document deleted', 'Close', { duration: NOTIF_DURATION });
          this.dialogRef.close();
        },
        error: (error) => {
          this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
        },
      });
  }

  revokeDocument(): void {
    this.isLoading = true;
    this.documentService
      .revokeDocument(this.data.document.id)
      .pipe(
        take(1),
        finalize(() => { 
          this.finalizeHanlde();
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Document revoked', 'Close', { duration: NOTIF_DURATION });
          this.dialogRef.close();
        },
        error: (error) => {
          this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
        },
      });
  }

  private finalizeHanlde(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}