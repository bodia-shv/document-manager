import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth.service';
import { finalize, take } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMAIL_PATTERN } from '../../shared/helpers/_consts';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent implements OnInit {

  public isLoading = false;
  public loginForm!: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .pipe(
          take(1),
          finalize(() => { this.isLoading = false })
        )
        .subscribe();
    }
  }
}
