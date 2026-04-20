import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-ed', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './enquiry-detail.html' })
export class EnquiryDetail implements OnInit {
  enquiry: any = null; newStatus = '';
  constructor(private route: ActivatedRoute, private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.svc.getEnquiry(this.route.snapshot.params['id']).subscribe(e => { this.enquiry = e; this.newStatus = e.status; }); }
  update() { this.svc.updateEnquiryStatus(this.enquiry._id, this.newStatus).subscribe({ next:()=>{this.toast.success('Updated');this.enquiry.status=this.newStatus;} }); }
}
