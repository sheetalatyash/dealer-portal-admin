import { Directive, TemplateRef, Input, ContentChild } from '@angular/core';

@Directive({
  selector: 'polaris-table-custom-cell',
  standalone: true,
})
export class PolarisTableCustomCellDirective {
  @Input() columnName!: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  @ContentChild(TemplateRef) public columnTemplate!: TemplateRef<any>;
}
