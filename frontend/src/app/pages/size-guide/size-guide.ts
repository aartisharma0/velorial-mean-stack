import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-size-guide',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './size-guide.html',
})
export class SizeGuidePage {}
