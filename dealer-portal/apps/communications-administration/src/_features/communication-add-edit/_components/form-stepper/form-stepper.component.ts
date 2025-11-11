import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisIcon } from '@dealer-portal/polaris-ui';
import { Router, RouterModule } from '@angular/router';
import { FormStep } from './form-stepper.type';

@Component({
  selector: 'ca-form-stepper',
  imports: [CommonModule, PolarisIcon, RouterModule],
  templateUrl: './form-stepper.component.html',
  styleUrl: './form-stepper.component.scss',
})
export class FormStepperComponent {
  @Input({ required: true }) steps: FormStep[] = [];
  @Input({ required: true }) activeStep = 0;

  @Output() navigateStep = new EventEmitter<FormStep>();

  constructor(private _router: Router) {}

  public onStepClick(step: FormStep): void {
    if (step.allowNavigation) {
      this.navigateStep.emit(step);
    }
  }
}
