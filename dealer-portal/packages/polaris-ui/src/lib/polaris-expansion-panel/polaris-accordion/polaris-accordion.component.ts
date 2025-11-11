import {
  Component,
  ContentChildren,
  Input,
  QueryList,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { PolarisUiBase } from '../../polaris-ui-base';
import { PolarisAccordionToggle } from '../polaris-accordion-toggle/polaris-accordion-toggle.component';
import { PolarisExpansionPanel } from '../polaris-expansion-panel.component';

@Component({
    selector: 'polaris-accordion',
  imports: [
    CommonModule,
    MatExpansionModule,
    PolarisAccordionToggle,
  ],
    templateUrl: './polaris-accordion.component.html',
    styleUrl: './polaris-accordion.component.scss'
})
export class PolarisAccordion extends PolarisUiBase {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  @ContentChildren(PolarisExpansionPanel, { descendants: true }) panels!: QueryList<PolarisExpansionPanel>;
  @Input() public showToggle: boolean = true;
  @Input() public allowMultipleExpanded: boolean = true;

  public self: PolarisAccordion = this;

  /**
   * A writable signal that determines whether a specific component or section
   * is expanded or collapsed. The signal holds a boolean value where `true`
   * represents an expanded state and `false` represents a collapsed state.
   */
  public readonly isExpanded: WritableSignal<boolean> = signal<boolean>(true);

  /** Toggles all child panels between expanded and collapsed states */
  public toggleChildPanels(): void {
    if (this.isExpanded()) {
      this.closeAllChildPanels();
    } else {
      this.openAllChildPanels();
    }
  }

  /** Expands all child panels */
  public openAllChildPanels(): void {
    this.panels.forEach((panel: PolarisExpansionPanel): void => panel.open());
    this.isExpanded.set(true);
  }

  /** Collapses all child panels */
  public closeAllChildPanels(): void {
    this.panels.forEach((panel: PolarisExpansionPanel): void => panel.close());
    this.isExpanded.set(false);
  }
}
