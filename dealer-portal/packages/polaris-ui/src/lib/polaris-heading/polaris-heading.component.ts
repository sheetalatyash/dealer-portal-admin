import {
  AfterViewInit,
  Component,
  ElementRef,
  EmbeddedViewRef, Input,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisHeadingLevel } from './polaris-heading.type';

@Component({
    selector: 'polaris-heading',
    imports: [CommonModule],
    templateUrl: './polaris-heading.component.html',
    styleUrl: './polaris-heading.component.scss'
})
export class PolarisHeading extends PolarisUiBase implements AfterViewInit {
  @Input() color: 'primary' | 'default' = 'default';

  @ViewChild('headingTemplate', { read: TemplateRef, static: true }) headingTemplate!: TemplateRef<unknown | null>;
  public headingLevel: PolarisHeadingLevel = 'h1'; // Default to <h1>

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
  ) {
    super();
  }

  public ngAfterViewInit(): void {

    // Set the heading level
    this.headingLevel = this._detectHeadingLevel();

    // Add the color class to the heading element
    const colorClass: string = this._getColorClass(this.color);

    // Make a new heading element
    const classList: string = `${this.customClass} display-${this.headingLevel} ${colorClass}`.trim();
    const headingElement: HTMLHeadingElement = this._renderer.createElement(this.headingLevel);
    headingElement.setAttribute('class', classList);
    headingElement.setAttribute('data-test-id', this.testId);

    // Add the new heading element to the template
    this._renderer.appendChild(this._elementRef.nativeElement, headingElement);

    // Re-Render the template
    if (this.headingTemplate) {
      const embeddedView: EmbeddedViewRef<unknown | null> = this.headingTemplate.createEmbeddedView(null);
      embeddedView.rootNodes.forEach(node => this._renderer.appendChild(headingElement, node));
      embeddedView.detectChanges();
    }
  }

  private _getColorClass(color: string): string {
    switch (color) {
      case 'primary':
        return 'text-primary';
      default:
        return '';
    }
  }

  private _detectHeadingLevel(): PolarisHeadingLevel {

    // Iterate over possible heading levels from 1 to 6
    for (let i = 1; i <= 6; i++) {
      const headingLevel: PolarisHeadingLevel = `h${i}` as PolarisHeadingLevel;

      if (this._elementRef.nativeElement.hasAttribute(headingLevel)) {
        return headingLevel;
      }
    }

    return this.headingLevel; // Default to <h1> if no specific attribute is found
  }
}
