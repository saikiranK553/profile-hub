import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'loginUser', 'storeAuthData']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create the component', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard if already authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle loginUser error response', fakeAsync(() => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();

    const errorResponse = { message: 'Invalid credentials' };
    authServiceSpy.loginUser.and.returnValue(throwError(() => errorResponse));

    component.loginForm.controls['email'].setValue('test@example.com');
    component.loginForm.controls['password'].setValue('wrongpassword');

    component.onSubmit();
    tick();

    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toBe('Invalid credentials');
    expect(snackBarSpy.open).toHaveBeenCalledWith('Invalid credentials', 'Close', jasmine.any(Object));
  }));
});
