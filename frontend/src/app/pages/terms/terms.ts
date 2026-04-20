import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './terms.html',
})
export class TermsPage {}
