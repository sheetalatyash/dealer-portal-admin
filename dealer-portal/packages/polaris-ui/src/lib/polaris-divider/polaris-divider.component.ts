import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { PolarisUiBase } from '../polaris-ui-base';

@Component({
    selector: 'polaris-divider',
    imports: [CommonModule, MatDividerModule],
    templateUrl: './polaris-divider.component.html',
    styleUrl: './polaris-divider.component.scss'
})
export class PolarisDivider extends PolarisUiBase {}
