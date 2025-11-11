import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Theme } from './theme.enum';
import { ProductLine } from './product-line.enum';

export interface Window {
  angularCdnLocation?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private _theme: Theme = Theme.Crp;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
  ) {}

  public switchTheme(newProductLine: ProductLine): void {
    // Find the <Theme> enum key name by the <ProductLine> enum value
    const themeKey: keyof typeof Theme = Object.keys(ProductLine)[
      Object.values(ProductLine).indexOf(newProductLine)
    ] as keyof typeof Theme;
    let themeLinkElement: HTMLLinkElement | null = this._document.getElementById('app-theme') as HTMLLinkElement | null;
    const angularCdnLocation: string | undefined = (window as Window)['angularCdnLocation'];

    this._theme = Theme[themeKey];
    const theme: string = angularCdnLocation
      ? `${angularCdnLocation}/${this._theme}`
      : this._theme;

    if (!themeLinkElement) {
      // This block used for init
      themeLinkElement = this._document.createElement('link');
      themeLinkElement.id = 'app-theme';
      themeLinkElement.rel = 'stylesheet';
      themeLinkElement.type = 'text/css';
      themeLinkElement.href = theme;

      const htmlHeadElement: HTMLHeadElement = this._document.getElementsByTagName('head')[0];
      htmlHeadElement.appendChild(themeLinkElement);
    } else if (themeLinkElement.href !== theme) {
      themeLinkElement.href = theme;
    }
  }
}
