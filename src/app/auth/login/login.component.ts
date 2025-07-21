import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation:ViewEncapsulation.None
})
export class LoginComponent implements OnInit,OnDestroy{
  private fb=inject(FormBuilder);
  private authService=inject(AuthService);
  private router=inject(Router);
  private destroy$ = new Subject<void>();
  private snackBar = inject(MatSnackBar);
  
  isSubmitting = false;
  errorMessage = '';
  
  loginForm!:FormGroup;
  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      console.log("already logged in ");
      return;
    }

    this.loginForm = this.fb.group({
    email: ['', Validators.required],  
    password: ['', Validators.required],
  });
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      console.log("Login form:", JSON.stringify(this.loginForm.value));
      
      this.authService.loginUser(this.loginForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            
            // Store authentication data
            this.authService.storeAuthData(response);
            
            this.isSubmitting = false;
            this.snackBar.open('Login successful!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            // Navigate to dashboard or intended route
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Login failed:', error);
            this.errorMessage = error.message || 'Login failed. Please try again.';
            this.snackBar.open(this.errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
            this.isSubmitting = false;
          }
        });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });

      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
    }
  }

    ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  }
