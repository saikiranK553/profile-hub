import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLink],
  //templateUrl: './header.component.html',
  //styleUrl: './header.component.scss'
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <!-- <a class="navbar-brand" routerLink="/dashboard">Your App</a> -->
        
        <div class="navbar-nav ms-auto" *ngIf="isAuthenticated">
          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" 
               role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ currentUser?.email || 'User' }}
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
              
              <li><a class="dropdown-item" (click)="logout()" style="cursor: pointer;">Logout</a></li>
            </ul>
          </div>
        </div>
        
        <div class="navbar-nav ms-auto" *ngIf="!isAuthenticated">
          <span class="navbar-text">Welcome To Profile-Hub</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
    }
    .nav-link {
      color: white !important;
    }
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class HeaderComponent implements OnInit,OnDestroy{
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private snackBar = inject(MatSnackBar);

  isAuthenticated = false;
  currentUser: any = null;
  isLoggingOut = false;

  ngOnInit() {
    // Subscribe to authentication state
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    
    // Show confirmation dialog (optional)
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout(true) // true to include refresh token
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Logout successful');
            this.isLoggingOut = false;
            this.snackBar.open('You have been logged out successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
            // AuthService will automatically navigate to login
          },
          error: (error) => {
            console.error('Logout error:', error);
            this.isLoggingOut = false;

            this.snackBar.open('Logout failed. Please try again.', 'Close', {
              duration: 4000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });
            // Even if logout fails, user will be logged out locally
          }
        });
    } else {
      this.isLoggingOut = false;
      this.snackBar.open('Logout cancelled', 'Close', {
        duration: 2000,
        panelClass: ['info-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }
}
