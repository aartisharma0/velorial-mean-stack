import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-addr', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './addresses.html' })
export class AddressesPage implements OnInit {
  addresses: any[] = [];
  newAddr: any = {type:'shipping',fullName:'',phone:'',street:'',city:'',state:'',zip:'',country:'India'};
  constructor(private svc: AddressService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAll().subscribe(r => this.addresses = r); }
  add() { this.svc.create(this.newAddr).subscribe({ next:()=>{this.toast.success('Added');this.load();}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') }); }
  del(id:string) { if(confirm('Delete?')) this.svc.delete(id).subscribe(()=>{this.toast.success('Deleted');this.load();}); }
}
