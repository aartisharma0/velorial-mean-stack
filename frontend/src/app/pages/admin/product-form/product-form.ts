import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
@Component({ selector: 'app-pf', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './product-form.html' })
export class ProductForm implements OnInit {
  isEdit = false; id = ''; categories: any[] = []; newImage = '';
  form: any = { name:'',slug:'',description:'',category:'',price:0,comparePrice:null,stock:0,sku:'',status:'draft',featured:false,images:[],variants:[] };
  constructor(private route: ActivatedRoute, private router: Router, private svc: ProductService, private catSvc: CategoryService, private toast: ToastService) {}
  ngOnInit() {
    this.catSvc.getAll().subscribe(r => this.categories = r);
    this.id = this.route.snapshot.params['id'];
    if (this.id) { this.isEdit = true; this.svc.getProductById(this.id).subscribe(p => { this.form = {...p, category: p.category?._id || p.category}; }); }
  }
  slugify() { this.form.slug = this.form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+Math.random().toString(36).substring(2,6); }
  addImage() { if(this.newImage) { this.form.images.push(this.newImage); this.newImage=''; } }
  removeImage(i:number) { this.form.images.splice(i,1); }
  addVariant() { this.form.variants.push({sku:'',size:'',color:'',priceModifier:0,stock:0}); }
  removeVariant(i:number) { this.form.variants.splice(i,1); }
  save() {
    const obs = this.isEdit ? this.svc.updateProduct(this.id, this.form) : this.svc.createProduct(this.form);
    obs.subscribe({ next:()=>{this.toast.success(this.isEdit?'Updated':'Created');this.router.navigate(['/admin/products']);}, error:(e:any)=>this.toast.error(e.error?.message||'Failed') });
  }
}
