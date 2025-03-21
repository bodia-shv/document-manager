import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, WritableSignal } from '@angular/core';
import { Subject, switchMap, takeUntil, of, expand, EMPTY, reduce, map } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { EUserType, IUser } from '../../core/models/user.model';
import { EDocumentStatus, IDocument } from '../../core/models/documents.models';
import { ProfileService } from '../../core/services/profile/profile.service';
import { DocumentService } from '../../core/services/documents/documents.service';
import { Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DocumentAddComponent } from './components/add-document-modal/add-document-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { PdfViewerComponent } from '../../shared/modals/pdf-viewer/pdf-viewer.component';
import { NOTIF_DURATION } from '../../shared/helpers/_consts';

@Component({
  selector: 'app-documents',
  standalone: false,
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentsComponent implements OnInit, OnDestroy {
  public user = signal<IUser | null>(null);
  public documents = signal<IDocument[]>([]);
  public displayedColumns!: string[];
  private destroy$ = new Subject<void>();
  public pageIndex = 0;
  public pageSize = 10;
  public totalDocuments = 0;
  public sort = 'name,asc';
  public filterStatus = signal<string | undefined>(undefined);
  public filterCreator = signal<string | undefined>(undefined);
  public readonly userRoles = EUserType;
  public readonly statuses = EDocumentStatus;
  private creators: WritableSignal<IUser[]> = signal([]);
  public filteredCreators: WritableSignal<IUser[]> = signal([]);

  public documentStatuses = [
    { value: '', viewValue: 'All' },
    { value: EDocumentStatus.Draft, viewValue: 'Draft' },
    { value: EDocumentStatus.Revoke, viewValue: 'Revoke' },
    { value: EDocumentStatus.ReadyForReview, viewValue: 'Ready for review' },
    { value: EDocumentStatus.UnderReview, viewValue: 'Under review' },
    { value: EDocumentStatus.Approved, viewValue: 'Approved' },
    { value: EDocumentStatus.Declined, viewValue: 'Declined' },
  ];


  constructor(
    private readonly profileService: ProfileService,
    private readonly documentService: DocumentService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.getUserData();
  }

  private getUserData(): void {
    this.profileService.user$.pipe(
      takeUntil(this.destroy$),
      switchMap(user => {
        if (user) {
          return of(user);
        } else {
          return this.profileService.getProfileData();
        }
      })
    ).subscribe(user => {
      this.user.set(user);
      this.setupColumns();
      this.loadDocuments();
      if (this.user()?.role === EUserType.Reviewer) {
        this.documentStatuses = this.documentStatuses.filter((x) => x.value !== EDocumentStatus.Draft);
        this.loadUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupColumns(): void {
    if (this.user()?.role === EUserType.Reviewer) {
      this.displayedColumns = ['name', 'status', 'creator', 'updatedAt', 'actions'];
    } else {
      this.displayedColumns = ['name', 'status', 'updatedAt', 'actions'];
    }
  }

  loadDocuments(): void {
    let creatorId: string | undefined;

    if (this.user()?.role === EUserType.Reviewer) {
      creatorId = this.filterCreator();
    }

    this.documentService.getDocuments(
      this.pageIndex + 1,
      this.pageSize,
      this.sort,
      this.filterStatus(),
      creatorId,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.totalDocuments = response.count;
      this.documents.set(response.results);
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadDocuments();
  }

  onSortChange(sortState: Sort): void {
    this.sort = sortState.active + ',' + sortState.direction;
    this.loadDocuments();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.filterStatus.set(this.filterStatus());
    this.filterCreator.set(this.filterCreator());
    this.loadDocuments();
  }

  loadUsers(): void {
    let page =1;
    const pageItems = 20;

    this.profileService.getUsers(page, pageItems).pipe(
      takeUntil(this.destroy$),
      expand((res) => {
        if (res.results.length === pageItems) {
          page++;
          return this.profileService.getUsers(page, pageItems);
        }
        return EMPTY;
      }),
      map((res) => res.results),
      reduce((allUsers: IUser[], currentUsers: IUser[]) => allUsers.concat(currentUsers), [])
    ).subscribe(users => {
      this.creators.set(users);
      this.filteredCreators.set(users);
    });
  }

  filterCreators(query: string): void {
    const filterValue = query.toLowerCase();
    this.filteredCreators.set(
      this.creators().filter((creator) =>
        creator.fullName.toLowerCase().includes(filterValue) ||
        creator.id.toLowerCase().includes(filterValue)
      )
    );
  }

  openAddDocumentDialog(): void {
    const dialogRef = this.dialog.open(DocumentAddComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDocuments();
      }
    });
  }

  deleteDocument(id: string, e: Event): void {
    this.stopPropagation(e);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Do you really want to delete this document?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.deleteDocument(id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.snackBar.open('Document deleted', 'Close', { duration: NOTIF_DURATION });
            this.loadDocuments();
          },
          error: (error) => {
            this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
          }
        });
      }
    });
  }

  revokeDocument(id: string, e: Event): void {
    this.stopPropagation(e);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Revoke this document?' }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documentService.revokeDocument(id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.snackBar.open('Document revoked', 'Close', { duration: NOTIF_DURATION });
            this.loadDocuments();
          },
          error: (error) => {
            this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
          }
        });
      }
    });
  }

  editDocument(id: string, e: Event): void {
    this.stopPropagation(e);
    this.documentService.getDocument(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (document: IDocument) => {
        const dialogRef = this.dialog.open(DocumentAddComponent, {
          width: '500px',
          data: { documentName: document.name, documentId: document.id }
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.loadDocuments();
          }
        });
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
      }
    });
  }

  viewDocument(id: string): void {
    this.documentService.getDocument(id).subscribe((document) => {
      const dialogRef = this.dialog.open(PdfViewerComponent, {
        width: '90%',
        data: {
          document: document,
          userRole: this.user()?.role,
        },
      });
    
      dialogRef.afterClosed().subscribe(() => {
        this.loadDocuments();
      });
    });
  }

  changeDocumentStatus(id: string, status: EDocumentStatus, rowStatus: EDocumentStatus, e: Event): void {
    this.stopPropagation(e);
    let allowedStatuses: EDocumentStatus[] = [];
  
    if (rowStatus === this.statuses.ReadyForReview) {
      allowedStatuses = [this.statuses.UnderReview];
    } else if (rowStatus === this.statuses.UnderReview) {
      allowedStatuses = [this.statuses.Approved, this.statuses.Declined];
    }
  
    if (allowedStatuses.includes(status)) {
      this.documentService.changeDocumentStatus(id, status).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.snackBar.open('Status changed', 'Close', { duration: NOTIF_DURATION });
          this.loadDocuments();
        },
        error: (error) => {
          this.snackBar.open(error.error.message, 'Close', { duration: NOTIF_DURATION });
        }
      });
    }
  }

  trackByCreatorId(index: number, creator: IUser): string {
    return creator.id;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}