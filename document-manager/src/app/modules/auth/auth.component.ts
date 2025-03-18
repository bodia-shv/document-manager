import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

  email = '';
  password = '';

  constructor(
    private readonly authService: AuthService,
  ) {}

  login() {
    this.authService.login(this.email, this.password).pipe(take(1)).subscribe();
  }
}
