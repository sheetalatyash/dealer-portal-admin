import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PolarisUiBase } from '../../polaris-ui-base';
import { PolarisButton } from '../../polaris-button';
import { Meridiem, PolarisTime, ValidationService } from '@dealer-portal/polaris-core';

@Component({
    selector: 'polaris-time-picker-dialog',
    imports: [CommonModule, ReactiveFormsModule, PolarisButton],
    providers: [DecimalPipe],
    templateUrl: './polaris-time-picker-dialog.component.html',
    styleUrl: './polaris-time-picker-dialog.component.scss'
})
export class PolarisTimePickerDialog extends PolarisUiBase implements OnInit, AfterViewInit {
  /**
   * Event emitted when a time is selected.
   */
  @Output('onSelect') onSelectEmitter: EventEmitter<PolarisTime> = new EventEmitter<PolarisTime>();

  /**
   * Event emitted when the dialog is canceled.
   */
  @Output('onCancel') onCancelEmitter: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Initial time to be set in the time picker.
   */
  @Input() initialTime?: PolarisTime;

  /**
   * The text to show for the confirm action
   */
  @Input() confirmText?: string = 'OK';

  /**
   * The text to show for the cancel action
   */
  @Input() cancelText?: string = 'Cancel';

  /**
   * Reference to the hours input element.
   */
  @ViewChild('hoursInput') hoursInput!: ElementRef<HTMLInputElement>;

  /**
   * Form group for the time picker inputs.
   */
  timeForm!: FormGroup;

  /**
   * Period of the day (AM/PM).
   */
  period!: Meridiem;

  constructor(
    private _decimalPipe: DecimalPipe,
    private _fb: FormBuilder,
    private _validationService: ValidationService
  ) {
    super();
  }

  /**
   * Initializes the component and sets up the form.
   */
  public ngOnInit(): void {
    this.timeForm = this._fb.group({
      hours: [
        this._decimalPipe.transform(this.initialTime?.hours ?? 12, '2.0'),
        [Validators.required, this._validationService.numericValidator({ min: 1, max: 12 })],
      ],
      minutes: [
        this._decimalPipe.transform(this.initialTime?.minutes ?? 0, '2.0'),
        [Validators.required, this._validationService.numericValidator({ min: 0.0, max: 59 })],
      ],
    });

    this.period = this.initialTime?.period ?? 'AM';
  }

  /**
   * Focuses on the hours input element after the view has been initialized.
   */
  public ngAfterViewInit(): void {
    this.hoursInput.nativeElement.focus();
  }

  /**
   * Sets the period of the day (AM/PM).
   * @param period - The period to set.
   */
  public onSelectPeriod(period: Meridiem): void {
    this.period = period;
  }

  /**
   * Emits the selected time if the form is valid.
   */
  public onSelectTime(): void {
    if (this.timeForm.valid) {
      const { minutes, hours } = this.timeForm.value;
      this.onSelectEmitter.emit({
        minutes: parseInt(minutes, 10),
        hours: parseInt(hours, 10),
        period: this.period,
      });
    }
  }

  /**
   * Emits the cancel event.
   */
  public onCancel(): void {
    this.onCancelEmitter.emit();
  }
}
