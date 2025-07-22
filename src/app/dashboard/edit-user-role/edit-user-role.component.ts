import { Component, Inject } from '@angular/core';
import { UserResponseDto } from '../../core/models/user.model';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';


export interface EditUserRoleDialogData {
  user: UserResponseDto;
}


@Component({
  selector: 'app-edit-user-role',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    MatChipsModule],
  templateUrl:'./edit-user-role.component.html' 
  ,
  styleUrls: ['./edit-user-role.component.scss']
})
export class EditUserRoleComponent {
  roleControl!: FormControl;
  constructor(
    public dialogRef: MatDialogRef<EditUserRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserRoleDialogData
  ) {
        this.roleControl = new FormControl(this.data.user.role, [Validators.required]);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.roleControl.valid) {
      this.dialogRef.close({
        userId: this.data.user.id,
        newRole: this.roleControl.value
      });
    }
  }

  getRoleColor(role: string): string {
    return role === 'ADMIN' ? 'warn' : 'primary';
  }
}
