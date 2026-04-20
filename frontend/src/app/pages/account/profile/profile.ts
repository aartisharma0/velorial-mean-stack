import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-profile', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './profile.html' })
export class ProfilePage {
  name = ''; phone = ''; currentPassword = ''; newPassword = ''; confirmPassword = '';
  constructor(public auth: AuthService, private toast: ToastService) { this.name = auth.user()?.name || ''; this.phone = auth.user()?.phone || ''; }
  updateProfile() { this.auth.updateProfile({name:this.name,phone:this.phone}).subscribe({ next:(r:any)=>this.toast.success('Updated'), error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  changePassword() {
    if (this.newPassword!==this.confirmPassword) { this.toast.error('Passwords do not match'); return; }
    this.auth.changePassword({currentPassword:this.currentPassword,password:this.newPassword}).subscribe({ next:(r:any)=>{this.toast.success('Password changed');this.currentPassword='';this.newPassword='';this.confirmPassword='';}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
