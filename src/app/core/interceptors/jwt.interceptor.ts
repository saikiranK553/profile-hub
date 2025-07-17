// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
// import { Injectable, inject } from "@angular/core";
// import { BehaviorSubject, Observable, catchError, throwError, switchMap, filter, take } from "rxjs";
// import { LoginResponse } from "../models/user.model";
// import { AuthService } from "../services/auth.service";

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//   private authService = inject(AuthService);
//   private isRefreshing = false;
//   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     // Skip token addition for authentication endpoints
//     console.log("JwtInterceptor triggered", request.url);
//     if (this.isAuthEndpoint(request.url)) {
//       return next.handle(request);
//     }

//     const token = this.authService.getAccessToken();
    
//     if (token && this.authService.isAuthenticated()) {
//       console.log("in intercept");
//       request = this.addTokenToRequest(request, token);
//     }
//     console.log("request "+request);
//     return next.handle(request).pipe(
//       catchError((error: HttpErrorResponse) => {
//         // Only handle 401 errors for token refresh
//         if (error.status === 401 && this.authService.getRefreshToken() && !this.isAuthEndpoint(request.url)) {
//           return this.handle401Error(request, next);
//         }
        
//         // For other errors, just throw them
//         return throwError(() => error);
//       })
//     );
//   }

//   private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     if (!this.isRefreshing) {
//       this.isRefreshing = true;
//       this.refreshTokenSubject.next(null);

//       return this.authService.refreshAccessToken().pipe(
//         switchMap((response: LoginResponse) => {
//           this.isRefreshing = false;
//           this.refreshTokenSubject.next(response.accessToken);
          
//           // Store the new token data
//           this.authService.storeAuthData(response);
          
//           // Retry the original request with new token
//           const newRequest = this.addTokenToRequest(request, response.accessToken);
//           return next.handle(newRequest);
//         }),
//         catchError(refreshError => {
//           this.isRefreshing = false;
//           this.refreshTokenSubject.next(null);
          
//           // Refresh failed, logout user
//           this.authService.logout(false); // Don't include refresh token since it's invalid
//           return throwError(() => refreshError);
//         })
//       );
//     } else {
//       // If we're already refreshing, wait for the new token
//       return this.refreshTokenSubject.pipe(
//         filter(token => token !== null),
//         take(1),
//         switchMap(token => {
//           const newRequest = this.addTokenToRequest(request, token);
//           return next.handle(newRequest);
//         })
//       );
//     }
//   }

//   private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
//     return request.clone({
//       setHeaders: {
//         Authorization: `Bearer ${token}`
//       }
//     });
//   }

//   private isAuthEndpoint(url: string): boolean {
//     const authEndpoints = [
//       '/api/auth/login',
//       '/api/auth/register',
//       '/api/auth/refresh',
//       '/api/auth/logout'
//     ];
    
//     return authEndpoints.some(endpoint => url.includes(endpoint));
//   }
// }

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, Observable, catchError, throwError, switchMap, filter, take } from "rxjs";
import { LoginResponse } from "../models/user.model";
import { AuthService } from "../services/auth.service";

// Global state for token refresh (outside the interceptor function)
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
  // Skip token addition for authentication endpoints
  console.log("JwtInterceptor triggered", req.url);
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  
  if (token && authService.isAuthenticated()) {
    console.log("in intercept");
    req = addTokenToRequest(req, token);
  }
  
  console.log("request", req);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401 errors for token refresh
      if (error.status === 401 && authService.getRefreshToken() && !isAuthEndpoint(req.url)) {
        return handle401Error(req, next, authService);
      }
      
      // For other errors, just throw them
      return throwError(() => error);
    })
  );
};

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshAccessToken().pipe(
      switchMap((response: LoginResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        
        // Store the new token data
        authService.storeAuthData(response);
        
        // Retry the original request with new token
        const newRequest = addTokenToRequest(request, response.accessToken);
        return next(newRequest);
      }),
      catchError(refreshError => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        
        // Refresh failed, logout user
        authService.logout(false); // Don't include refresh token since it's invalid
        return throwError(() => refreshError);
      })
    );
  } else {
    // If we're already refreshing, wait for the new token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const newRequest = addTokenToRequest(request, token!);
        return next(newRequest);
      })
    );
  }
}

function addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isAuthEndpoint(url: string): boolean {
  const authEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/logout'
  ];
  
  return authEndpoints.some(endpoint => url.includes(endpoint));
}