import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsRoutingModule } from './documents.routes';
import { DocumentsComponent } from './documents.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table'; 
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { DocumentAddComponent } from './components/add-document-modal/add-document-modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [DocumentsComponent, DocumentAddComponent],
  imports: [
    CommonModule,
    FormsModule,
    DocumentsRoutingModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatInput,
    MatOption,
    MatDialogModule,
    MatFormField,
    MatButtonModule,
    MatIconModule,
    NgxMatSelectSearchModule,
    MatError,
    ReactiveFormsModule,
    MatTooltipModule
  ]
})
export class DocumentsModule { }
