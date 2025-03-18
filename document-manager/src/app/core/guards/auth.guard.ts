import { Observable } from "rxjs";
import { AuthService } from "../services/auth/auth.service";
import { Injectable } from "@angular/core";
import { Router, UrlTree } from "@angular/router";

@Injectable()
export class AuthGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    void this.router.navigate(['/sign-in']);
    return false;
  }
}