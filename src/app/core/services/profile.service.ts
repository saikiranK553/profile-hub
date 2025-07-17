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

  /**
   * Get all users with pagination (Admin only)
   * @param page Page number (0-based)
   * @param size Page size
   * @returns Observable<PageResponse<UserResponseDto>>
   */
  getAllUsers(page: number, size: number): Observable<PageResponse<UserResponseDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageResponse<UserResponseDto>>(`${this.apiUrl}/admin/list`, { params });
  }

  /**
   * Delete user by ID (Admin only)
   * @param id User ID
   * @returns Observable<string>
   */
  deleteUserById(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/delete/${id}`);
  }

  // In your profile.service.ts
// deleteUserById(userId: number): Observable<string> {
//   return this.http.delete(`${this.apiUrl}/users/delete/${userId}`, {
//     responseType: 'text'
//   });
// }

  /**
   * Get current user from localStorage
   * @returns User ID or null
   */
  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('currentUserId');
    return userId ? +userId : null;
  }

  /**
   * Get current user role from localStorage
   * @returns User role or null
   */
  getCurrentUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  /**
   * Check if current user is admin
   * @returns boolean
   */
  isCurrentUserAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }
}
