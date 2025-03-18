import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal } from '@angular/core';
import { Subject, switchMap, takeUntil, of, expand, EMPTY, reduce, map } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { EUserType, IUser } from '../../core/models/user.model';
import { EDocumentStatus, IDocument } from '../../core/models/documents.models';
import { ProfileService } from '../../core/services/profile/profile.service';
import { DocumentService } from '../../core/services/documents/documents.service';
import { Sort } from '@angular/material/sort';

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

  public documentStatuses = [
    { value: '', viewValue: 'All' },
    { value: EDocumentStatus.Draft, viewValue: 'Draft' },
    { value: EDocumentStatus.Revoke, viewValue: 'Revoke' },
    { value: EDocumentStatus.ReadyForReview, viewValue: 'Ready for review' },
    { value: EDocumentStatus.UnderReview, viewValue: 'Under review' },
    { value: EDocumentStatus.Approved, viewValue: 'Approved' },
    { value: EDocumentStatus.Declined, viewValue: 'Declined' },
  ];

  public creators!: IUser[];

  constructor(
    private readonly profileService: ProfileService,
    private readonly documentService: DocumentService
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
      this.creators = users;
    });
  }

  trackByCreatorId(index: number, creator: IUser): string {
    return creator.id;
  }
}