import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBarDuration = 3000; 

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string, action: string = 'Закрити') {
    this.snackBar.open(message, action, {
      duration: this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar'] 
    });
  }

  showError(message: string, action: string = 'Закрити') {
    this.snackBar.open(message, action, {
      duration: this.snackBarDuration,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}