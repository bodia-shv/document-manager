import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../../../../core/services/documents/documents.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EDocumentStatus } from '../../../../core/models/documents.models';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NOTIF_DURATION } from '../../../../shared/helpers/_consts';

@Component({
  selector: 'app-add-document-modal',
  standalone: false,
  templateUrl: './add-document-modal.component.html',
  styleUrl: './add-document-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DocumentAddComponent {
  public documentForm!: FormGroup;
  public selectedFileName = '';
  public isLoading = false;
  public documentId: string | null = null;

  private destroy$ = new Subject<void>();

  public readonly acceptedFileType = '.pdf';
  public readonly statuses = EDocumentStatus;
  private readonly nameMaxlength = 50;

  constructor(
    private readonly documentService: DocumentService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    public readonly dialogRef: MatDialogRef<DocumentAddComponent>,
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.handleEditData();
  }

  private handleEditData(): void {
    if (this.data && this.data.documentName && this.data.documentId) {
      this.documentForm.patchValue({ documentName: this.data.documentName });
      this.documentId = this.data.documentId;
      this.documentForm.get('selectedFile')?.setValidators([]);
      this.documentForm.get('selectedFile')?.updateValueAndValidity();
    }
  }

  private initForm(): void {
    this.documentForm = this.fb.group({
      documentName: ['', [Validators.required, Validators.maxLength(this.nameMaxlength)]],
      selectedFile: [null, Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.documentForm.get('selectedFile')?.setValue(file);
    this.selectedFileName = file ? file.name : '';
  }

  saveDocument(status: EDocumentStatus): void {
    this.isLoading = true;
    const docName = this.documentForm.get('documentName')?.value;
    const doc = this.documentForm.get('selectedFile')?.value;

    this.documentService.addDocument(docName, doc, status).pipe(
      take(1),
      finalize(() => { this.isLoading = false })
    ).subscribe({
      next: () => {
        this.snackBar.open('Document saved!', 'Close', { duration: NOTIF_DURATION });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
      }
    });
  }

  updateDocument(): void {
    this.isLoading = true;
    const docName = this.documentForm.get('documentName')?.value;
    this.documentService.updateDocument(this.documentId?.toString() as string, docName).pipe(
      take(1),
      finalize(() => { this.isLoading = false })
    ).subscribe({
      next: () => {
        this.snackBar.open('Changes saved!', 'Close', { duration: NOTIF_DURATION });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
      }
    })
  }
}