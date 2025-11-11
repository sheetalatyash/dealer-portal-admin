import { Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  Input,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { polarisDefaultTooltipDelay, PolarisTooltipDirective } from '../polaris-tooltip';
import { PolarisUiBase } from '../polaris-ui-base';
import { PolarisIconColor } from './polaris-icon-color.type';
import { PolarisIconSize } from './polaris-icon-size.type';


@Component({
    selector: 'polaris-icon',
    imports: [CommonModule],
    templateUrl: './polaris-icon.component.html',
    styleUrl: './polaris-icon.component.scss'
})
export class PolarisIcon extends PolarisUiBase implements AfterViewInit {
  @ViewChild('iconTemplate', { read: TemplateRef, static: true }) iconTemplate!: TemplateRef<unknown>;

  @Input() color: string | PolarisIconColor= '';
  @Input() size: string | PolarisIconSize = 'md';
  @Input() tooltipShowDelay: number = polarisDefaultTooltipDelay;
  @Input() tooltipHideDelay: number = polarisDefaultTooltipDelay;

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _viewContainer: ViewContainerRef,
    private _injector: Injector,
  ) {
    super();
  }

  public ngAfterViewInit(): void {
    // Make a new <i> element
    const iconElement: HTMLElement = this._renderer.createElement('i');
    iconElement.setAttribute('data-test-id', this.testId);

    // Add tooltip dynamically
    if (this.tooltip) {
      this._attachTooltip(iconElement, this.tooltip);
    }

    // Add the new <i> element to the template
    this._renderer.appendChild(this._elementRef.nativeElement, iconElement);

    // Re-Render the template
    if (this.iconTemplate) {
      const embeddedView: EmbeddedViewRef<unknown> = this.iconTemplate.createEmbeddedView(null);
      embeddedView.rootNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          // Extract the icon name from the template's content
          const iconGlyphClass: string = `polaris-icon-${node.textContent.trim()}`;
          const iconSizeClass: string = `polaris-icon-size-${this.size}`;
          const iconColorClass: string = this.color
            ? `polaris-icon-color-${this.color}`
            : '';
          const classList = `polaris-icon ${iconGlyphClass} ${iconSizeClass} ${iconColorClass} ${this.customClass}`.trim();

          // Set the class attribute on the <i> element
          iconElement.setAttribute('class', classList);
        }
      });
      embeddedView.detectChanges();
    }
  }

    /**
     * Attaches a tooltip to a specified HTML element using the PolarisTooltipDirective.
     *
     * @param element - The HTML element to which the tooltip will be attached.
     * @param tooltipContent - The content to be displayed within the tooltip.
     * @returns void
     */
  private _attachTooltip(element: HTMLElement, tooltipContent: string): void {
    const directive: PolarisTooltipDirective = new PolarisTooltipDirective(
      this._viewContainer,
      new ElementRef(element),
      this._injector.get(Overlay),
    );

    // Set any inputs required by the directive
    directive.tooltipHtml = tooltipContent;

    // Pass in optional inputs
    directive.tooltipShowDelay = this.tooltipShowDelay;
    directive.tooltipHideDelay = this.tooltipHideDelay;

    this._renderer.listen(element, 'mouseenter', (): void => {
      directive.onMouseEnter();
    });
    this._renderer.listen(element, 'mouseleave', (): void => {
      directive.onMouseLeave();
    });
    this._renderer.listen(element, 'focus', (): void => {
      directive.onFocus();
    });
    this._renderer.listen(element, 'blur', (): void => {
      directive.onBlur();
    });
  }
}
