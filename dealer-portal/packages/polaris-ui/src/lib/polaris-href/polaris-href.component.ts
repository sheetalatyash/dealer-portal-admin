import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisUiBase } from '../polaris-ui-base';

/**
 * A component for rendering a hyperlink with customizable styling and behavior.
 *
 * @example
 * <polaris-href [underline]="false">Custom Link</polaris-href>
 */
@Component({
  selector: 'polaris-href',
  imports: [CommonModule],
  templateUrl: './polaris-href.component.html',
  styleUrl: './polaris-href.component.scss',
})
export class PolarisHref extends PolarisUiBase {
  /**
   * Determines whether the link should have an underline.
   *
   * @default true
   */
  // TODO: This should be 'hover', 'always', true, or 'none'/false
  @Input() underline: boolean = true;

  /**
   * The URL to navigate to when the link is activated.
   * If omitted, the component will behave like a button (still look like a link) and only emit click events.
   */
  @Input() url: string | null = null;

  /**
   * Shortcut to open link in a new browser tab (sets target and rel attributes appropriately).
   */
  @Input() openInNewTab: boolean = false;

  /**
   * Explicit target attribute to use. Ignored if openInNewTab is true.
   */
  @Input() target: '_self' | '_blank' | '_parent' | '_top' | string | null = null;

  /**
   * rel attribute for the anchor element (security / SEO). Auto-populated with "noopener noreferrer" when openInNewTab is true.
   */
  @Input() rel: string | null = null;

  /**
   * Optional download filename; if provided this behaves as a download link.
   */
  @Input() download: string | null = null;

  /**
   * Whether to prevent navigation when disabled.
   */
  @Input() preventNavigationWhenDisabled: boolean = true;

  /** Computed href value for template binding */
  get href(): string | null {
    if (!this.url) return null; // allow button-like mode
    return this.url;
  }

  /** Computed target attribute */
  get computedTarget(): string | null {
    if (this.openInNewTab) return '_blank';
    return this.target;
  }

  /** Computed rel attribute with security additions for new tab */
  get computedRel(): string | null {
    if (this.openInNewTab) {
      // Merge existing rel if user supplied any portion
      const base = 'noopener noreferrer';
      if (this.rel) {
        // ensure required tokens present
        const tokens = new Set((this.rel + ' ' + base).split(/\s+/).filter(Boolean));
        return Array.from(tokens).join(' ');
      }
      return base;
    }
    return this.rel;
  }

  /** Whether element should have role=button instead of default link semantics */
  get isButtonLike(): boolean {
    return !this.href;
  }

  /** Prevent navigation when disabled */
  override emitClickEvent(event: MouseEvent): void {
    if (this.disabled && this.preventNavigationWhenDisabled) {
      event.preventDefault();
      event.stopPropagation();
    }
    super.emitClickEvent(event);
  }

  /** Handles keydown events for accessibility */
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent scrolling on Space
      this.emitClickEvent(new MouseEvent('click')); // Trigger a click event
    }
  }
}
