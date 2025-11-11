import { Component, ElementRef, ViewChild } from '@angular/core';
import { PolarisUiBase } from '../polaris-ui-base';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'polaris-icon-button',
    imports: [CommonModule],
    templateUrl: './polaris-icon-button.component.html',
    styleUrl: './polaris-icon-button.component.scss'
})
export class PolarisIconButton extends PolarisUiBase {
  @ViewChild('iconButton') iconButton!: ElementRef<HTMLButtonElement>;
}
