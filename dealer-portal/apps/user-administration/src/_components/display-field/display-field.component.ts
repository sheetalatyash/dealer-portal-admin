import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'ua-display-field',
    imports: [
        CommonModule,
    ],
    templateUrl: './display-field.component.html',
    styleUrl: './display-field.component.scss'
})
export class DisplayFieldComponent {
  @Input() alignmentClass: string = 'align-items-center';
}
