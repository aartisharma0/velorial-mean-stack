import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-cf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './category-form.html' })
export class CategoryForm implements OnInit {
  isEdit = false; id = ''; parents: any[] = [];
  form: any = { name:'',slug:'',description:'',parent:null,isActive:true,sortOrder:0,image:'' };
  constructor(private route: ActivatedRoute, private router: Router, private svc: CategoryService, private toast: ToastService) {}
  ngOnInit() {
    this.svc.getParents().subscribe(r => this.parents = r);
    this.id = this.route.snapshot.params['id'];
    if (this.id) { this.isEdit = true; this.svc.getAll().subscribe(cats => { const c = cats.find((x:any)=>x._id===this.id); if(c) this.form = {...c, parent: c.parent?._id||null}; }); }
  }
  slugify() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); }
  save() {
    const obs = this.isEdit ? this.svc.update(this.id, this.form) : this.svc.create(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/categories']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
