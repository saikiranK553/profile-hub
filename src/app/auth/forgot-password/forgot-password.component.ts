import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit{
  private fb=inject(FormBuilder);
  private authService=inject(AuthService);
  forgotPasswordForm!:FormGroup;
  ngOnInit() {
    this.forgotPasswordForm=this.fb.group({
      email:['',Validators.required]
    })
  }

  onSubmit(){
    
  }

}
