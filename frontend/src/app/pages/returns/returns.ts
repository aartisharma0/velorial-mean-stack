import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './returns.html',
})
export class ReturnsPage {}
