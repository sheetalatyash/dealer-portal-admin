import { TemplateRef } from '@angular/core';

/**
 * Represents a group option for Polaris-UI components that accept a group generic group of options.
 *
 * @template T - The type of data associated with the option.
 */
export class PolarisGroupOption<T> {
  /**
   * The value of the option.
   * @type {string | number}
   */
  public value: string | number = '';

  /**
   * The label displayed next to the option.
   * @type {string}
   */
  public label: string = '';

  /**
   * The classes to apply to the label.
   * @type {string}
   */
  public labelClass: string = '';

  /**
   * Indicates whether the option is disabled.
   * @default false
   */
  public disabled: boolean = false;

  /**
   * Indicates whether the option is selected.
   * @default false
   */
  public selected: boolean = false;

  /**
   * Indicates whether the option is optional.
   * @default false
   */
  public optional: boolean = false;

  /**
   * Test ID associated with the option.
   * For use ing automated testing frameworks.
   * @type {string}
   */
  public testId!: string;

  /**
   * The minimum width of the option.
   * @type {string}
   * @default 'unset'
   */
  public minWidth: string = 'unset';

  /**
   * The form control name associated with the option.
   * @type {string}
   */
  public formControlName: string = '';

  /**
   * The tooltip to show with the option.
   * @type {string | undefined}
   */
  public tooltip?: string | undefined = undefined;

  /**
   * Additional data associated with the option.
   */
  public data?: T;

  /**
   * The nested options for this group option.
   * @type {PolarisGroupOption<T>[] | undefined}
   */
  public children?: PolarisGroupOption<T>[];

  /**
   * Custom HTML or `TemplateRef` content to render alongside a specific option.
   *
   * ### Purpose
   * Enables injection of contextual information, helper text, or rich markup
   * directly into option-based components (e.g., `<polaris-checkbox-group>`).
   *
   * ### Supported Types
   * - **`TemplateRef<unknown>`** — reference to an Angular template (e.g., `#myTemplate`)
   * - **`string`** — raw HTML or text (sanitized before rendering)
   * - **`null`** — no custom content
   *
   * ### Examples
   * #### 1. Using a TemplateRef
   * ```html
   * <ng-template #vendorInfo>
   *   <div class="text-muted small">Vendor Number: {{ userDetails.vendorNumber }}</div>
   * </ng-template>
   *
   * <polaris-checkbox-group
   *   [options]="[
   *     new PolarisGroupOption({
   *       label: 'Eligible for SPIFFs',
   *       customContent: vendorInfo,
   *     })
   *   ]"
   * ></polaris-checkbox-group>
   * ```
   *
   * #### 2. Using Raw HTML (Safe)
   * ```typescript
   * const htmlSnippet: string = '<span class="text-danger">* Required</span>';
   * const options = [
   *   new PolarisGroupOption({
   *     label: 'Active User',
   *     customContent: htmlSnippet,
   *   }),
   * ];
   * ```
   *
   * #### Rendering Implementation Example
   * ```html
   * <ng-container *ngIf="customContent instanceof TemplateRef; else htmlBlock">
   *   <ng-container *ngTemplateOutlet="customContent"></ng-container>
   * </ng-container>
   *
   * <ng-template #htmlBlock>
   *   <div [innerHTML]="safeHtmlContent"></div>
   * </ng-template>
   * ```
   *
   * @see Angular DomSanitizer
   * @remarks Always sanitize raw HTML using `DomSanitizer.bypassSecurityTrustHtml`
   * to prevent injection of unsafe content.
   *
   * @type {TemplateRef<unknown> | string | null}
   */
  public customContent?: TemplateRef<unknown> | string | null;

  /**
   * Constructs a new PolarisGroupOption instance.
   *
   * @param option - An optional object containing initial values for the option properties.
   * @default {}
   */
  constructor(option: Partial<PolarisGroupOption<T>> = {}) {
    Object.assign(this, option);

    // If testId is not provided, generate one from the label
    if (!this.testId) {
      this.testId = this._generateTestId(this.label);
    }
  }

  /**
   * Generates a test ID prefixed with "polaris-option-" based on the label.
   * @param label The label to convert into a test ID.
   * @returns A sanitized string prefixed with "polaris-checkbox-".
   *
   * @note
   * The type of element will be determined by the html template.
   * i.e.
   * if the element is a checkbox, '-checkbox' will be appended to the test id.
   * if the element is a radio button, '-radio-button' will be appended to the test id
   *
   * @example
   * (if checkbox)
   * const option1 = new PolarisGroupOption({ label: 'User Name' });
   * console.log(option1.testId); // Output: "polaris-option-user-name-checkbox"
   *
   * (if radio-button)
   * const option2 = new PolarisGroupOption({ label: 'Admin Panel!' });
   * console.log(option2.testId); // Output: "polaris-option-admin-panel-radio-button"
   *
   * const option3 = new PolarisGroupOption({ label: 'Hello @ World', testId: 'custom-id' });
   * console.log(option3.testId); // Output: "custom-id-<ELEMENT TYPE>" (uses provided testId)
   */
  private _generateTestId(label: string): string {
    return `polaris-option-` + label
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove special characters
      .trim();
  }
}
