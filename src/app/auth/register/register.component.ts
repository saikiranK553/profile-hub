import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit{
  private fb=inject(FormBuilder);
  private authService=inject(AuthService);
  private router=inject(Router);

  registerForm!:FormGroup;
  ngOnInit() {
    this.registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['',Validators.required],
    address: [''],
    bio: [''],
    });
  }

  onSubmit(){
    if(this.registerForm.valid){
      console.log("form is "+JSON.stringify(this.registerForm.valid));
      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('User registered successfully:', response);
          
          
          // Reset form
          this.registerForm.reset();
          
          // Navigate to login page after a delay
          //setTimeout(() => {
            this.router.navigate(['/auth/login']);
          //}, 2000);
        },
        error: (error) => {
          console.error('Registration failed:', error);
          
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
    }
  }


