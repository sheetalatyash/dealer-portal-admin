import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisLoaderSize } from './polaris-loader-enum';

@Component({
    selector: 'polaris-loader',
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './polaris-loader.component.html',
    styleUrl: './polaris-loader.component.scss'
})
export class PolarisLoader extends PolarisUiBase {

  /**
   * The size of the loader spinner.
   * Default value is 26.
   */
  @Input() loaderSize: number = PolarisLoaderSize.Md;
}
