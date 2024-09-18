import { Component } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-mat-checkbox',
  standalone: true,
  imports: [ MatCheckboxModule ],
  template: `
    <mat-checkbox>Check me!</mat-checkbox>
  `,
  styles: ``
})
export class MatCheckboxComponent {

}
