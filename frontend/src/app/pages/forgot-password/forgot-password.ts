import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-fp', standalone: true, imports: [CommonModule, RouterModule, FormsModule], templateUrl: './forgot-password.html' })
export class ForgotPasswordPage { email=''; sent=false; submit() { this.sent=true; } }
