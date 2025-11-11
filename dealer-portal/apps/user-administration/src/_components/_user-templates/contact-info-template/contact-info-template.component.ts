import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DealerOptions, User } from '@classes';
import { UserTemplateBaseComponent } from '@components/_user-templates/user-template-base';
import { PhoneNumberPipe, ValidationService } from '@dealer-portal/polaris-core';
import { DisplayFieldComponent } from '@components/display-field';
import { PolarisInput } from '@dealer-portal/polaris-ui';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UserAdministrationService } from '@services';
import { NestedFormValues } from '@types';
import { tap } from 'rxjs';

export interface ContactInfoFormData {
  name: string;
  formGroup: FormGroup;
}

@UntilDestroy()
@Component({
    selector: 'ua-contact-info-template',
    imports: [
        CommonModule,
        DisplayFieldComponent,
        PhoneNumberPipe,
        PolarisInput,
        ReactiveFormsModule,
        TranslatePipe,
    ],
    templateUrl: './contact-info-template.component.html',
    styleUrl: './contact-info-template.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ContactInfoTemplateComponent extends UserTemplateBaseComponent {
  public contactInfoFormData: WritableSignal<ContactInfoFormData | null> = signal<ContactInfoFormData | null>(null);
  public userDetails: WritableSignal<User | null> = signal<User | null>(null);
  public phoneNumberPipe: PhoneNumberPipe = new PhoneNumberPipe();

  public phoneInputType: 'phone' | 'number' = 'phone';
  public IntlPhoneMaxLength: number = 15;
  public phoneInputMaxLength: number | null = null;
  public jobTitleLabel: string = '';

  public originalFormValues!: ReturnType<FormGroup['getRawValue']>;
  public pageName: string = 'profile';
  public formName: string = 'contactInfo';

  /**
   * Per Business Requirements:
   */
  public inputCharacterLimit: number = 100;
  public emailCharacterLimit: number = 50;

  constructor(
    public override translateService: TranslateService,
    public override userAdministrationService: UserAdministrationService,
    private _translationService: TranslateService,
    private _formBuilder: FormBuilder,
    private _validationService: ValidationService,
  ) {
    super(translateService, userAdministrationService);

    this.jobTitleLabel =
      this.userAdministrationService.isJobTitleRequired() ?
      this._translationService.instant('form.job-title') :
      this._translationService.instant('form.job-title-optional');

    this.phoneInputType = this.userAdministrationService.isPhoneFormatRequired() ? 'phone' : 'number';
    this.phoneInputMaxLength = this.userAdministrationService.isPhoneFormatRequired() ? null : this.IntlPhoneMaxLength;

    this._initContactInfoFormDataEffect();
    this._initFormEffect();
  }

  private _initContactInfoFormDataEffect(): void {
    effect(() => {
      const dealerOptions: DealerOptions | null = this.userAdministrationService.dealerOptions();
      const userDetails: User | null = this.userAdministrationService.userDetails();

      if (!dealerOptions ||!userDetails) return;

      this.userDetails.set(userDetails);
      this._buildContactInfoData();
    });
  }

  private _initFormEffect(): void {
    effect(() => {
      const contactInfoFormData: ContactInfoFormData| null = this.contactInfoFormData();

      if (!contactInfoFormData) return;

      this._updateContactInfoForm(contactInfoFormData);

    });
  }

  private _buildContactInfoData(): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const phone: string | null =
      this.userAdministrationService.isPhoneFormatRequired() ?
      this.phoneNumberPipe.transform(userDetails.phone) :
      userDetails.phone;

    const jobTitleValidators: ValidatorFn[] =
      this.userAdministrationService.isJobTitleRequired()
        ? [Validators.required, Validators.maxLength(this.inputCharacterLimit)]
        : [Validators.maxLength(this.inputCharacterLimit)];

    const phoneValidator: ValidatorFn =
      this.userAdministrationService.isPhoneFormatRequired()
        ? this._validationService.phoneValidator()
        : this._validationService.digitsOnlyValidator();

    // Build the user contact info form
    const contactInfoFormGroup: FormGroup = this._formBuilder.group({
        userName:         [userDetails.userName, [Validators.required, this._validationService.emailValidator(), Validators.maxLength(this.emailCharacterLimit)]],
        confirmUserName:  [userDetails.userName, [Validators.required, this._validationService.emailValidator(), Validators.maxLength(this.emailCharacterLimit)]],
        firstName:        [userDetails.firstName, [Validators.required, Validators.maxLength(this.inputCharacterLimit)]],
        lastName:         [userDetails.lastName, [Validators.required, Validators.maxLength(this.inputCharacterLimit)]],
        jobTitle:         [userDetails.jobTitle, jobTitleValidators],
        phone:            [phone, [phoneValidator]],
      },
      {
        validators: [
          this._validationService.confirmInputMatchValidator('userName', 'confirmUserName'),
        ],
      });

    const contactInfoFormData: ContactInfoFormData = {
      name:'contactInfo',
      formGroup: contactInfoFormGroup,
    };

    if (this.isAddView) {
      // Add view
      contactInfoFormData.formGroup.updateValueAndValidity({ emitEvent: false });
    } else {
      // Edit view
      contactInfoFormData.formGroup.updateValueAndValidity();
      contactInfoFormData.formGroup.markAsTouched();
    }

    this.originalFormValues = contactInfoFormData.formGroup.getRawValue();

    this.contactInfoFormData.set(contactInfoFormData);

    this._subscribeToFormGroupEvents();
  }

  private _subscribeToFormGroupEvents(): void {
    const contactInfoForm: FormGroup | undefined = this.contactInfoFormData()?.formGroup;

    if (!contactInfoForm) return;

    contactInfoForm.valueChanges.pipe(
      tap(() => {
        // Watch for changes
        const raw: NestedFormValues = contactInfoForm.getRawValue();
        const changed: boolean = this.haveObjectsChanged(this.originalFormValues, raw);
        this.userAdministrationService.contactInfoFormChanged.set(changed);
      }),
      untilDestroyed(this),
    ).subscribe();

    contactInfoForm.statusChanges
      .pipe(
        tap((): void => {
          const isInvalid: boolean = contactInfoForm.invalid;

          // Add view
          if (this.isAddView && !contactInfoForm.touched) {
            return;
          }

          this.userAdministrationService.contactInfoFormInvalid.set(isInvalid);
        }),
        untilDestroyed(this),
      ).subscribe();
  }

  private _updateContactInfoForm(
    contactInfoFormData: ContactInfoFormData,
  ): void {
    const userDetails: User = this.userAdministrationService.userDetails() as User;
    const phone: string | null =
      this.userAdministrationService.isPhoneFormatRequired() ?
      this.phoneNumberPipe.transform(userDetails.phone) :
      userDetails.phone;

    contactInfoFormData.formGroup.patchValue({
      userName: userDetails.userName,
      confirmUserName: userDetails.userName,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      jobTitle: userDetails.jobTitle,
      phone,
    });
  }

  public getFormControl(controlName: string): FormControl {
    return this.contactInfoFormData()?.formGroup.get(controlName) as FormControl;
  }

  public removeUserNames(): void {
    const userNameFormControl: FormControl = this.contactInfoFormData()?.formGroup.get('userName') as FormControl;
    const confirmUserNameFormControl: FormControl = this.contactInfoFormData()?.formGroup.get('confirmUserName') as FormControl;

    userNameFormControl.reset();
    confirmUserNameFormControl.reset();
    this.contactInfoFormData()?.formGroup.updateValueAndValidity();
  }
}
