import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_CHECKBOX_DEFAULT_OPTIONS, MatCheckboxDefaultOptions, MatCheckboxModule } from '@angular/material/checkbox';
import { CommunicationBadgeComponent } from '@components';
import { Communication, CommunicationType } from '@dealer-portal/polaris-core';
import { PolarisIcon, PolarisIconButton } from '@dealer-portal/polaris-ui';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

/**
 * Component representing a single communication item in a list.
 * Handles selection, favoriting, and click events for a communication.
 */
@Component({
    selector: 'comm-communication-list-item',
    imports: [
        CommonModule,
        MatCheckboxModule,
        CommunicationBadgeComponent,
        PolarisIconButton,
        FormsModule,
        PolarisIcon,
        TranslatePipe
    ],
    providers: [
        { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } as MatCheckboxDefaultOptions },
    ],
    templateUrl: './communication-list-item.component.html',
    styleUrl: './communication-list-item.component.scss'
})
export class CommunicationListItemComponent {
  /**
   * The communication object to display.
   */
  @Input() communication!: Communication;

  /**
   * Indicates if the communication is currently selected.
   */
  @Input() isSelected: boolean = false;

  /**
   * Indicates if the user is currently impersonating another user.
   */
  @Input() isImpersonating: boolean = false;

  /**
   * Emits when the communication item is clicked.
   */
  @Output() communicationClicked: EventEmitter<Communication> = new EventEmitter<Communication>();

  /**
   * Emits when the communication is favorited.
   */
  @Output() communicationFavorited: EventEmitter<Communication> = new EventEmitter<Communication>();

  /**
   * Emits when the communication is selected.
   */
  @Output() communicationSelected: EventEmitter<Communication> = new EventEmitter<Communication>();

  /**
   * Reference to the CommunicationType enum for use in the template.
   */
  public CommunicationType: typeof CommunicationType = CommunicationType;

  /**
   * The date format string, localized using the translation service.
   */
  public dateFormat: string = this._translate.instant('date-format');

  /**
   * Indicates if the component currently has focus.
   */
  public hasFocus: boolean = false;

  /**
   * Creates an instance of CommunicationListItemComponent.
   * @param _translate The translation service for localization.
   */
  constructor(
    private _translate: TranslateService,
  ) {}

  /**
   * Updates the focus state of the component.
   * @param hasFocus True if the component has focus, false otherwise.
   */
  public onFocusChange(hasFocus: boolean): void {
    this.hasFocus = hasFocus;
  }

  public getExpiredText(endDate: string): string {
    return new Date(endDate) < new Date() ? 'Expired' : 'Expires';
  }
}
