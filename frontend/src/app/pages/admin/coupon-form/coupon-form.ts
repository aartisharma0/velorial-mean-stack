import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-cpf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './coupon-form.html' })
export class CouponForm implements OnInit {
  isEdit = false; id = '';
  form: any = { code:'',type:'percent',value:0,minOrder:null,usesLeft:null,expiresAt:'',isActive:true };
  constructor(private route: ActivatedRoute, private router: Router, private svc: AdminService, private toast: ToastService) {}
  ngOnInit() { this.id = this.route.snapshot.params['id']; if(this.id) { this.isEdit = true; this.svc.getCoupons().subscribe(r => { const c = r.find((x:any)=>x._id===this.id); if(c) this.form = {...c}; }); } }
  save() {
    const obs = this.isEdit ? this.svc.updateCoupon(this.id, this.form) : this.svc.createCoupon(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/coupons']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
