import { Component, forwardRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { MatButtonComponent } from "src/shared-component/mat-button/mat-button.component";
import { MatCheckboxComponent } from "../shared-component/mat-checkbox/mat-checkbox.component";
import { MatInputTextComponent } from "../shared-component/mat-input-text/mat-input-text.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputHpComponent } from 'src/shared-component/mat-input-hp/mat-input-hp.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule, ReactiveFormsModule,
    MatButtonComponent, MatCheckboxComponent,
    MatInputTextComponent,
    MatIconModule, MatFormFieldModule, MatInputModule, MatInputHpComponent, forwardRef(() => MatInputHpComponent),
],
  template: `
    <app-mat-checkbox></app-mat-checkbox>

    <app-mat-button>버튼</app-mat-button>

    <div [formGroup]="fg">

      <mat-form-field>
        <mat-label>Favorite food</mat-label>
        <input matInput placeholder="Ex. Pizza" formControlName="input_text" required>
      </mat-form-field>

      <!--<app-mat-input-text formControlName="input_text"></app-mat-input-text>-->

      <mat-form-field>
        <mat-label>Phone number</mat-label>
        <app-mat-input-hp formControlName="input_tel" required></app-mat-input-hp>
        <mat-icon matSuffix>phone</mat-icon>
        <mat-hint>Include area code</mat-hint>
      </mat-form-field>

    </div>

    {{this.fg.getRawValue() | json }}
  `,
  styles: `
    :host {
      font-color: white;
    }

  `
})
export class AppComponent {
  title = 'ng-material';

  fb = inject(FormBuilder);
  fg = this.fb.group({
    input_text: ['text', Validators.required ],
    input_tel: ['', Validators.required ]
  });

  constructor() {
  }
}
