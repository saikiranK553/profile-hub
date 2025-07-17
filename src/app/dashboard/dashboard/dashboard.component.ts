import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { PageResponse, UserResponseDto } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../../core/services/profile.service';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})



export class DashboardComponent implements OnInit{

  // private profileService = inject(ProfileService);
  // private dialog = inject(MatDialog);
  // private snackBar = inject(MatSnackBar);

  // currentUser: UserResponseDto | null = null;
  // users: UserResponseDto[] = [];
  // totalUsers = 0;
  // pageSize = 10;
  // pageIndex = 0;
  // isAdmin = false;
  // loading = false;

  // displayedColumns: string[] = ['profileImage', 'name', 'email', 'role', 'lastLogin', 'actions'];

  // ngOnInit() {
  //   this.loadCurrentUser();
  //   this.checkAdminRole();
  // }

  // loadCurrentUser() {
  //   const currentUserId = this.profileService.getCurrentUserId();
  //   if (currentUserId) {
  //     this.profileService.getUserById(currentUserId).subscribe({
  //       next: (user) => {
  //         this.currentUser = user;
  //         this.isAdmin = user.role === 'ADMIN';
  //         if (this.isAdmin) {
  //           this.loadAllUsers();
  //         }
  //       },
  //       error: (error) => this.handleError('Failed to load user details', error)
  //     });
  //   }
  // }

  // checkAdminRole() {
  //   this.isAdmin = this.profileService.isCurrentUserAdmin();
  // }

  // loadAllUsers() {
  //   if (!this.isAdmin) return;
    
  //   this.loading = true;
  //   this.profileService.getAllUsers(this.pageIndex, this.pageSize).subscribe({
  //     next: (response: PageResponse<UserResponseDto>) => {
  //       this.users = response.content;
  //       this.totalUsers = response.totalElements;
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       this.handleError('Failed to load users', error);
  //       this.loading = false;
  //     }
  //   });
  // }

  // onPageChange(event: PageEvent) {
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.loadAllUsers();
  // }

  // deleteUser(userId: number) {
  //   const user = this.users.find(u => u.id === userId);
  //   if (confirm(`Are you sure you want to delete user: ${user?.username}?`)) {
  //     this.profileService.deleteUserById(userId).subscribe({
  //       next: (message) => {
  //         this.snackBar.open(message, 'Close', { duration: 3000 });
  //         this.loadAllUsers(); // Refresh the list
  //       },
  //       error: (error) => this.handleError('Failed to delete user', error)
  //     });
  //   }
  // }

  // private handleError(message: string, error: any) {
  //   console.error(message, error);
  //   this.snackBar.open(message, 'Close', { duration: 5000 });
  // }

  // getRoleColor(role: string): string {
  //   return role === 'ADMIN' ? 'warn' : 'primary';
  // }

  // formatDate(dateString: string): string {
  //   return new Date(dateString).toLocaleDateString();
  // }

  currentUser: any = null;
  users: any[] = [];
  isAdmin = false;
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.checkAdminStatus();
    if (this.isAdmin) {
      this.loadAllUsers();
    }
  }

  loadCurrentUser() {
    this.profileService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Failed to load current user', error);
      }
    });
  }

  checkAdminStatus() {
    this.isAdmin = this.authService.hasRole('ADMIN');
  }

  loadAllUsers() {
    this.profileService.getAllUsers().subscribe({
      next: (response) => {
        this.users = response.users || response.content || response;
      },
      error: (error) => {
        console.error('Failed to load users', error);
      }
    });
  }

  deleteUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (confirm(`Delete user: ${user?.username}?`)) {
      this.profileService.deleteUserById(userId).subscribe({
        next: (response) => {
          const message = typeof response === 'string' ? response : 'User deleted successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.loadAllUsers();
        },
        error: (error) => {
          // Handle HTTP 200 with text response
          if (error.status === 200) {
            const message = typeof error.error === 'string' ? error.error : 'User deleted successfully';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            this.loadAllUsers();
          } else {
            this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
          }
        }
      });
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'warn' : 'primary';
  }
  
}
