import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
@Component({ selector: 'app-contact', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './contact.html' })
export class ContactPage {
  form: any = { name:'', email:'', phone:'', subject:'', message:'' };
  constructor(private svc: AdminService, private toast: ToastService) {}
  submit() { this.svc.submitEnquiry(this.form).subscribe({ next:(r:any)=>{this.toast.success(r.message);this.form={name:'',email:'',phone:'',subject:'',message:''};}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
}
