import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({ selector: 'app-cs', standalone: true, imports: [CommonModule, RouterModule], templateUrl: './checkout-success.html' })
export class CheckoutSuccessPage implements OnInit, AfterViewInit {
  order: any = null;

  constructor(private route: ActivatedRoute, private orderSvc: OrderService) {}

  ngOnInit() {
    this.orderSvc.getOrderById(this.route.snapshot.params['id']).subscribe(o => this.order = o);
  }

  ngAfterViewInit() {
    this.launchConfetti();
  }

  openInvoice() {
    this.orderSvc.getInvoice(this.order._id).subscribe(res => {
      const win = window.open('', '_blank');
      if (win) { win.document.write(res.html); win.document.close(); }
    });
  }

  private launchConfetti() {
    const colors = ['#d63384', '#ff69b4', '#ffd700', '#00d2ff', '#7b68ee', '#ff6347', '#32cd32'];
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:-10px;left:${Math.random()*100}vw;width:${Math.random()*10+5}px;height:${Math.random()*10+5}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:${Math.random()>0.5?'50%':'2px'};z-index:9999;pointer-events:none;animation:confettiFall ${Math.random()*2+2}s linear forwards;`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }, i * 40);
    }

    // Add CSS animation if not exists
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}`;
      document.head.appendChild(style);
    }
  }
}
