import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponseDto, PageResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private http=inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8082/api/users';


  getUserById(id: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/view/${id}`);
  }

  getAllUsers(page: number, size: number): Observable<PageResponse<UserResponseDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageResponse<UserResponseDto>>(`${this.apiUrl}/admin/list`, { params });
  }

  deleteUserById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${id}`);
  }

  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('currentUserId');
    return userId ? +userId : null;
  }

  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  isCurrentUserAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    const url = `${this.apiUrl}/admin/update-role/${userId}`;
    const body = { role: role };
    
    return this.http.patch(url, body, {
      responseType: 'json'
    });
  }

}
