import { Component, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mat-input-text',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <mat-form-field>
      <mat-label>Favorite food</mat-label>
      <input matInput placeholder="Ex. Pizza">
    </mat-form-field>
  `,
  styles: `
  `
})
export class MatInputTextComponent {

}
