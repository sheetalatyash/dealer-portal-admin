import { AfterViewInit, Component, computed, Input, signal, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { PolarisHref } from '../../polaris-href';
import { PolarisAccordion } from '../polaris-accordion/polaris-accordion.component';
import { PolarisExpansionPanel } from '../polaris-expansion-panel.component';

@UntilDestroy()
@Component({
  selector: 'polaris-accordion-toggle',
  imports: [CommonModule, PolarisHref],
  templateUrl: './polaris-accordion-toggle.component.html',
  styleUrl: './polaris-accordion-toggle.component.scss',
})
export class PolarisAccordionToggle implements AfterViewInit {
  @Input() public polarisAccordion!: PolarisAccordion;

  /**
   * A writable signal that determines whether a specific component or section
   * is expanded or collapsed. The signal holds a boolean value where `true`
   * represents an expanded state and `false` represents a collapsed state.
   */
  public readonly isExpanded: WritableSignal<boolean> = signal<boolean>(true);

  /**
   * A reactive signal representing the label for a toggle, which dynamically updates
   * based on the expanded state.
   *
   * The signal emits either 'Collapse All' or 'Expand All' depending on the return
   * value of the `isExpanded` function. When `isExpanded` returns `true`, the value
   * is 'Collapse All', otherwise it is 'Expand All'.
   */
  public readonly toggleLabel: Signal<'Collapse All' | 'Expand All'> = computed(
    (): 'Collapse All' | 'Expand All' => this.isExpanded() ? 'Collapse All' : 'Expand All'
  );

  /**
   * Lifecycle hook that is called after Angular has fully initialized the component's view.
   * Typically used to perform additional initialization tasks that require access to the view's children or its properties.
   *
   * This implementation subscribes to the panel changes to listen and react to updates.
   *
   * @return {void} No return value.
   */
  public ngAfterViewInit(): void {
    this._subscribeToPanelChanges();
  }

  /**
   * Subscribes to changes in panel states and executes corresponding logic when panels open or close.
   *
   * @return {void} Does not return a value.
   */
  private _subscribeToPanelChanges(): void {
    // Listen for any panel open/close events
    this.polarisAccordion.panels.changes.pipe(
      tap((): void => {
        this._watchPanelStates();
      }),
      untilDestroyed(this),
    ).subscribe();

    this._watchPanelStates();
  }

  /**
   * Monitors the state changes (open/close events) of all panels and updates their expanded state accordingly.
   * Initializes the state value on the initial execution.
   *
   * @return {void} This method does not return a value.
   */
  private _watchPanelStates(): void {
    // Watch all panels for state changes
    this.polarisAccordion.panels.forEach((panel: PolarisExpansionPanel): void => {

      // Listen for open events
      panel.opened.pipe(
        tap((): void => {
          this._updateIsExpanded();
        }),
        untilDestroyed(this),
      ).subscribe();

      // Listen for close events
      panel.closed.pipe(
        tap((): void => {
          this._updateIsExpanded();
        }),
        untilDestroyed(this),
      ).subscribe();

    });
    // Set initial value
    this._updateIsExpanded();
  }

  /**
   * Updates the `isExpanded` property based on the expanded state of all panels.
   * Determines if all panels in the `panels` collection are currently expanded,
   * and sets the `isExpanded` property accordingly.
   *
   * @return {void} Does not return a value.
   */
  private _updateIsExpanded(): void {
    const allOpen: boolean = this.polarisAccordion.panels.toArray().every((panel: PolarisExpansionPanel): boolean => panel.expanded);
    this.isExpanded.set(allOpen);
  }

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
    this.polarisAccordion.panels.forEach((panel: PolarisExpansionPanel): void => panel.open());
    this.isExpanded.set(true);
  }

  /** Collapses all child panels */
  public closeAllChildPanels(): void {
    this.polarisAccordion.panels.forEach((panel: PolarisExpansionPanel): void => panel.close());
    this.isExpanded.set(false);
  }
}
