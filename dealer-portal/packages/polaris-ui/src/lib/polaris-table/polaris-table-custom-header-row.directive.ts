import { Directive, TemplateRef, Input, ContentChild } from '@angular/core';

@Directive({
  selector: 'polaris-table-custom-header-row',
  standalone: true,
})
export class PolarisTableCustomHeaderRowDirective {
  @Input() customClass: string = '';
  @ContentChild(TemplateRef) public headerRowTemplate!: TemplateRef<any>;
}
