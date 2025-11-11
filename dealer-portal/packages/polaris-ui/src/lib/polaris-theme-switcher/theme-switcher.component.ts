import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { ProductLine } from './product-line.enum';
import { ThemeService } from './theme.service';

@Component({
    selector: 'polaris-devtool-theme-switcher',
    imports: [
        CommonModule,
        MatSelectModule,
    ],
    templateUrl: './theme-switcher.component.html',
    styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  public productLines: ProductLine[] = Object.values(ProductLine);
  public currentProductLine: ProductLine = ProductLine.Crp;

  constructor(private _themeService: ThemeService) {}

  public switchTheme(productLine: ProductLine): void {
    this.currentProductLine = productLine;
    this._themeService.switchTheme(this.currentProductLine);
  }
}
