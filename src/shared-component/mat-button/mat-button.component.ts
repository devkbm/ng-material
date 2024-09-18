import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mat-button',
  standalone: true,
  imports: [ MatButtonModule ],
  template: `
    <button mat-flat-button><ng-content></ng-content></button>
  `,
  styles: ``
})
export class MatButtonComponent {
  text = input<string>('');
}
