import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateUserRequest, LoginRequest, LoginResponse, UserResponseDto } from '../models/user.model';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router=inject(Router);
  private readonly API_GATEWAY_URL = 'http://localhost:8082';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUser());
  
  private isRefreshingToken = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkTokenValidity();
  }

  registerUser(userData: CreateUserRequest): Observable<UserResponseDto> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<UserResponseDto>(
      `${this.API_GATEWAY_URL}/api/auth/register`,
      userData,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  loginUser(loginRequest:LoginRequest):Observable<LoginResponse>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_GATEWAY_URL}/api/auth/login`,
      loginRequest,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  

  storeAuthData(response: LoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenType', response.tokenType);
    localStorage.setItem('expiresIn', response.expiresIn.toString());
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('currentUserId',JSON.stringify(response.user.id))
    
    const expirationTime = new Date().getTime() + (response.expiresIn * 1000);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(response.user);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  hasValidToken(): boolean {
    const token = this.getAccessToken();
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return false;
    }

    const expirationTime = parseInt(expiration);
    const currentTime = new Date().getTime();
    
    return currentTime < expirationTime;
  }

  private checkTokenValidity(): void {
    if (!this.hasValidToken() && this.getRefreshToken()) {
      this.refreshAccessToken().subscribe({
        next: (response) => {
          this.storeAuthData(response);
        },
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.logout();
        }
      });
    }
  }

  refreshAccessToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.isRefreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(() => {
          return new Observable<LoginResponse>(observer => {
            const response: LoginResponse = {
              accessToken: this.getAccessToken() || '',
              refreshToken: this.getRefreshToken() || '',
              tokenType: localStorage.getItem('tokenType') || 'Bearer',
              expiresIn: parseInt(localStorage.getItem('expiresIn') || '0'),
              user: this.getCurrentUser(),
              error: null
            };
            observer.next(response);
            observer.complete();
          });
        })
      );
    }

    this.isRefreshingToken = true;
    this.refreshTokenSubject.next(null);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(
      `${this.API_GATEWAY_URL}/api/auth/refresh`,
      { refreshToken },
      { headers }
    ).pipe(
      switchMap((response: LoginResponse) => {
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(response.accessToken);
        return new Observable<LoginResponse>(observer => {
          observer.next(response);
          observer.complete();
        });
      }),
      catchError(error => {
        this.isRefreshingToken = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(includeRefreshToken: boolean = true): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    let logoutRequest: Observable<any>;
    
    if (includeRefreshToken && refreshToken) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAccessToken()}`
      });

      logoutRequest = this.http.post(
        `${this.API_GATEWAY_URL}/api/auth/logout`,
        { refreshToken },
        { headers }
      );
    } else {
      logoutRequest = new Observable(observer => {
        observer.next({});
        observer.complete();
      });
    }

    return logoutRequest.pipe(
      catchError(error => {
        console.error('Logout error:', error);
        return new Observable(observer => {
          observer.next({});
          observer.complete();
        });
      }),
      switchMap(() => {
        this.clearAuthData();
        return new Observable(observer => {
          observer.next({});
          observer.complete();
        });
      })
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('currentUserId');
    
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  private handleError(error: any) {
  let errorMessage = 'An error occurred';
  
  if (error.error instanceof ErrorEvent) {
    errorMessage = `Error: ${error.error.message}`;
  } else {
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400 && error.error?.errors) {
      errorMessage = error.error.errors.join(', ');
    } else if (error.status === 409) {
      errorMessage = 'User already exists';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
  }
  
  console.error('AuthService Error:', errorMessage);
  return throwError(() => ({ message: errorMessage }));
}
  
}


