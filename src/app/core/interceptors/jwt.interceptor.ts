import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, Observable, catchError, throwError, switchMap, filter, take } from "rxjs";
import { LoginResponse } from "../models/user.model";
import { AuthService } from "../services/auth.service";

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  
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
      if (error.status === 401 && authService.getRefreshToken() && !isAuthEndpoint(req.url)) {
        return handle401Error(req, next, authService);
      }
      
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
        
        authService.storeAuthData(response);
        
        const newRequest = addTokenToRequest(request, response.accessToken);
        return next(newRequest);
      }),
      catchError(refreshError => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        
        authService.logout(false);
        return throwError(() => refreshError);
      })
    );
  } else {
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