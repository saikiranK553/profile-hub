import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { PageResponse, UserResponseDto } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditUserRoleComponent } from '../edit-user-role/edit-user-role.component';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
  MatProgressSpinnerModule,
EditUserRoleComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})



export class DashboardComponent implements OnInit{


  private profileService = inject(ProfileService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  currentUser: UserResponseDto | null = null;
  users: UserResponseDto[] = [];
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  isAdmin = false;
  loading = false;

  displayedColumns: string[] = ['name', 'email', 'role', 'lastLogin', 'actions'];
  

  ngOnInit() {
    this.loadCurrentUser();
    this.checkAdminRole();
  }

  loadCurrentUser() {
    const currentUserId = this.profileService.getCurrentUserId();
    if (currentUserId) {
      this.profileService.getUserById(currentUserId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.isAdmin = user.role === 'ADMIN';
          if (this.isAdmin) {
            this.loadAllUsers();
          }
        },
        error: (error) => this.handleError('Failed to load user details', error)
      });
    }
  }

  checkAdminRole() {
    this.isAdmin = this.profileService.isCurrentUserAdmin();
  }

  loadAllUsers() {
    if (!this.isAdmin) return;
    
    this.loading = true;
    this.profileService.getAllUsers(this.pageIndex, this.pageSize).subscribe({
      next: (response: PageResponse<UserResponseDto>) => {
        this.users = response.content;
        this.totalUsers = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Failed to load users', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAllUsers();
  }

  editUserRole(user: UserResponseDto) {
  const dialogRef = this.dialog.open(EditUserRoleComponent, {
    width: '500px',
    height:'72vh',
    data: { user: user },
    disableClose: false,
    autoFocus: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.updateUserRole(result.userId, result.newRole, user.username);
    }
  });
}

private updateUserRole(userId: number, newRole: string, username: string) {
  this.profileService.updateUserRole(userId, newRole).subscribe({
    next: (response) => {
      this.snackBar.open(`${username}'s role updated successfully to ${newRole}`, 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.loadAllUsers();
    },
    error: (error) => {
      this.handleError(`Failed to update user role for ${username}`, error);
    }
  });
}


  deleteUser(userId: number) {
    const user = this.users.find(u => u.id === userId);
    if (confirm(`Are you sure you want to delete user: ${user?.username}?`)) {
      this.profileService.deleteUserById(userId).subscribe({
        next: (response:any) => {
          const message = response.message || 'User deleted successfully';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.loadAllUsers();
        },
        error: (error) => this.handleError('Failed to delete user', error)
      });
    }
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.snackBar.open(message, 'Close', { duration: 5000 });
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'warn' : 'primary';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  onTabChange(index: number) {
    if (index === 1 && this.isAdmin) {
      this.loadAllUsers();
    }
  }
  
}
