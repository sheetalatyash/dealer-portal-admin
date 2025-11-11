import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  CommunicationAccount,
  CommunicationApplication,
  Communication,
  CommunicationCode,
  CommunicationMessage,
  CommunicationStatus,
  CommunicationStatusType,
  DatetimeService,
  PolarisTime,
} from '@dealer-portal/polaris-core';
import {
  PolarisButton,
  PolarisDialogService,
  PolarisHeading,
  PolarisHref,
  PolarisIcon,
  PolarisLoader,
  PolarisNotificationService,
} from '@dealer-portal/polaris-ui';
import { CommunicationAddEditStep } from '@enums/communication-add-edit-step.enum';
import { Route } from '@enums/route.enum';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommunicationsService } from '@services/communications/communications.service';
import { LookupService } from '@services/lookup/lookup.service';
import { catchError, combineLatest, EMPTY, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { DealerAccountListingVm } from '../../_view_models/dealer-account-listing.vm';
import { UserAccountListingVm } from '../../_view_models/user-account-listing.vm';
import { FormStepperComponent } from './_components/form-stepper/form-stepper.component';
import { FormStep } from './_components/form-stepper/form-stepper.type';
import { StandardDialogComponent } from './_components/standard-dialog/standard-dialog.component';
import { CommunicationAddEditAccountTargetsComponent } from './_views/communication-add-edit-account-targets/communication-add-edit-account-targets.component';
import { CommunicationAddEditMessageComponent } from './_views/communication-add-edit-message/communication-add-edit-message.component';

import { CommunicationAddEditReviewComponent } from './_views/communication-add-edit-review/communication-add-edit-review.component';
import { CommunicationAddEditTranslationsComponent } from './_views/communication-add-edit-translations/communication-add-edit-translations.component';
import { CommunicationAddEditUserTargetsComponent } from './_views/communication-add-edit-user-targets/communication-add-edit-user-targets.component';
import { TooltipService } from './services/tooltip/tooltip.service';

@UntilDestroy()
@Component({
  selector: 'ca-communication-add-edit',
  imports: [
    CommonModule,
    RouterModule,
    PolarisHeading,
    PolarisHref,
    PolarisIcon,
    PolarisButton,
    FormStepperComponent,
    CommunicationAddEditMessageComponent,
    ReactiveFormsModule,
    PolarisLoader,
    TranslatePipe,
    CommunicationAddEditAccountTargetsComponent,
    CommunicationAddEditReviewComponent,
    CommunicationAddEditUserTargetsComponent,
    CommunicationAddEditTranslationsComponent,
  ],
  templateUrl: './communication-add-edit.component.html',
  styleUrl: './communication-add-edit.component.scss',
})
export class CommunicationAddEditComponent implements OnInit {
  CommunicationAddEditStep = CommunicationAddEditStep;

  // Header Variables
  public formSteps: FormStep[] = [
    {
      id: CommunicationAddEditStep.Message,
      label: this._translate.instant('form.step.message'),
      link: '',
      allowNavigation: false,
      testId: 'messageStepperLink',
    },
    {
      id: CommunicationAddEditStep.AccountTargets,
      label: this._translate.instant('form.step.account-targets'),
      link: '',
      allowNavigation: false,
      testId: 'accountTargetsStepperLink',
    },
    {
      id: CommunicationAddEditStep.UserTargets,
      label: this._translate.instant('form.step.user-targets'),
      link: '',
      allowNavigation: false,
      testId: 'userTargetsStepperLink',
    },
    {
      id: CommunicationAddEditStep.Translation,
      label: this._translate.instant('form.step.translation'),
      link: '',
      allowNavigation: false,
      testId: 'translationStepperLink',
    },
    {
      id: CommunicationAddEditStep.Review,
      label: this._translate.instant('form.step.review'),
      link: '',
      allowNavigation: false,
      testId: 'reviewStepperLink',
    },
  ];
  public currentStepId: CommunicationAddEditStep | null = null;
  public formTitle = '';

  // Edit Variables
  private _isEditMode = false;
  public communicationGuid: string | null = null;
  public communication?: Communication;

  // Form Variables
  public communicationFormGroup!: FormGroup;
  public isFormLoading: boolean = false;
  private _isChildFormLoading: boolean = false;
  private _hasTranslationFormChanges: boolean = false;

  private _communicationStatuses: CommunicationStatus[] = [];
  private _allSectionsValid: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef,
    private _communicationService: CommunicationsService,
    private _datetimeService: DatetimeService,
    private _formBuilder: FormBuilder,
    private _lookupService: LookupService,
    private _polarisDialogService: PolarisDialogService,
    private _polarisNotificationService: PolarisNotificationService,
    private _router: Router,
    private _translate: TranslateService,
    public toolTipService: TooltipService,
  ) {}

  public ngOnInit(): void {
    this._listenToUrl();
  }

  private _listenToUrl(): void {
    combineLatest([this._route.url, this._route.data, this._route.paramMap])
      .pipe(
        map(([urlSegments, data, paramMap]) => {
          this.currentStepId = urlSegments.length ? (urlSegments[0].path as CommunicationAddEditStep) : null;
          this._isEditMode = data['mode'] === 'edit';
          this.communicationGuid ??= paramMap.get('communicationGuid');

          if (this.currentStepId === CommunicationAddEditStep.Review) {
            this.formTitle = this._translate.instant('form.title.review');
          } else if (this._isEditMode) {
            this.formTitle = this._translate.instant('form.title.edit');
          } else {
            this.formTitle = this._translate.instant('form.title.add');
          }

          return this.communicationGuid;
        }),
        tap((communicationGuid: string | null) => {
          // Update the form steps for stepper navigation based on communicationGuid
          this.formSteps.forEach((step) => {
            step.allowNavigation = communicationGuid !== null;
            step.link = [
              this._isEditMode ? Route.CommunicationEdit : Route.CommunicationAdd,
              communicationGuid,
              step.id,
            ].join('/');
          });
        }),
        switchMap((communicationGuid: string | null) => {
          if (communicationGuid) {
            return this._communicationService.getCommunication$(communicationGuid);
          } else {
            return of(undefined);
          }
        }),
        untilDestroyed(this),
      )
      .subscribe((communication: Communication | undefined) => {
        if (!communication && this._isEditMode) {
          this._polarisNotificationService.danger(this._translate.instant('notification.get-communication.failed'));
        }

        this.communication = communication;
        this._buildCommunicationForm(communication);
        this._allSectionsValid = this.areAllSectionsValid();
        this._changeDetectorRef.detectChanges();

        if (this.currentStepId === CommunicationAddEditStep.Translation) {
          this._getCommunicationStatuses();
        }
      });
  }

  private _getCommunicationStatuses(): void {
    this._lookupService
      .getStatuses$()
      .pipe(untilDestroyed(this))
      .subscribe((statuses: CommunicationStatus[]) => {
        this._communicationStatuses = statuses;
      });
  }

  private _buildCommunicationForm(communication?: Communication): void {
    this.communicationFormGroup = this._formBuilder.group({
      message: this._buildMessageForm(communication),
      accountTargets: this._buildAccountTargetsForm(communication),
      userTargets: this._buildUserTargetsForm(communication),
      translations: this._buildTranslationForm(communication),
      review: this._formBuilder.group({}),
    });
  }

  private _buildMessageForm(communication?: Communication): FormGroup {
    // Retrieve date, time, and timezone information from the communication object or set to current date/time
    let startDate: Date;
    let endDate: Date;
    let startTime: PolarisTime;
    let endTime: PolarisTime;
    let timezoneOffset: number;
    if (communication) {
      [startDate, startTime, timezoneOffset] = this._datetimeService.getDatetimeComponents(
        communication.startDate ?? '',
      );
      [endDate, endTime] = this._datetimeService.getDatetimeComponents(communication.endDate ?? '');
    } else {
      const today = new Date();
      startDate = today;
      startTime = this._datetimeService.get12HourTimeFromDate(today);
      endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      endTime = this._datetimeService.get12HourTimeFromDate(today);
      timezoneOffset = today.getTimezoneOffset();
    }

    return this._formBuilder.group({
      defaultLanguage: [communication?.defaultMessage?.cultureCode ?? 'en-US', [Validators.required]],
      title: [communication?.defaultMessage?.title ?? '', [Validators.required]],
      message: [communication?.defaultMessage?.messageBody ?? '', [Validators.required]],
      keywords: [communication?.defaultMessage?.keywords ?? ''],
      internalNotes: [communication?.defaultMessage?.internalNotes ?? ''],
      communicationStatus: [communication?.statusId, [Validators.required]],
      messageStatus: [communication?.defaultMessage?.statusId, [Validators.required]],
      group: [communication?.group?.groupId ?? null, [Validators.required]],
      subGroup: [communication?.subGroup?.subGroupId ?? -1, [Validators.required]],
      timezone: [timezoneOffset ?? 0, [Validators.required]],
      startDate: [startDate, [Validators.required]],
      startTime: [startTime, [Validators.required]],
      endDate: [endDate, [Validators.required]],
      endTime: [endTime, [Validators.required]],
      attachments: [communication?.defaultMessage?.attachments ?? []],
    });
  }

  private _buildAccountTargetsForm(communication?: Communication): FormGroup {
    return this._formBuilder.group({
      parentAccountsOptions: this._formBuilder.group({}),
      partnerTypeSelected: [!!communication?.partnerTypes?.length],
      partnerTypeOptions: this._formBuilder.group({}),
      productLineSelected: [!!communication?.productLines?.length],
      productLineOptions: this._formBuilder.group({}),
      customerClassSelected: [!!communication?.custClasses?.length],
      customerClassOptions: this._formBuilder.group({}),
      salesTerritoryOrRegionSelected: [],
      salesTerritoryOrRegionOptions: [],
      countrySelected: [],
      countryOptions: [],
      stateOrProvinceSelected: [],
      stateOrProvinceOptions: [],
      specificAccountSelected: [],
      specificAccountOptions: [],
    });
  }

  private _buildUserTargetsForm(communication?: Communication): FormGroup {
    return this._formBuilder.group({
      departmentSelected: [!!communication?.departments?.length],
      departmentOptions: this._formBuilder.group({}),
      staffRoleSelected: [!!communication?.roles?.length],
      staffRoleOptions: this._formBuilder.group({}),
      serviceStaffRoleSelected: [!!communication?.serviceStaffRoles?.length],
      serviceStaffRoleOptions: this._formBuilder.group({}),
      securityOrAppPermissionsSelected: [false],
      securityOrAppPermissionsOptions: [],
      securityOrAppPermissionsSelectedResults: [],
      specificAccountSelected: [!!communication?.userAccounts?.length],
      specificAccountOptions: [],
    });
  }

  private _buildTranslationForm(communication?: Communication): FormGroup {
    return this._formBuilder.group({
      translations: [communication?.messages ?? []],
    });
  }

  private _getCommunicationSaveObservable(): Observable<boolean> {
    let saveObservable: Observable<boolean> = EMPTY;
    this.currentFormGroup.updateValueAndValidity();
    if (this.currentFormGroup.valid) {
      switch (this.currentStepId) {
        case CommunicationAddEditStep.Message: {
          const communicationToSave = this._convertMessageFormValuesToCommunication();
          if (!this.communicationGuid) {
            // Special case, all other updates will return true/false, but creating a communication will return the communicationGuid
            // Save the communicationGuid for future steps then map to a success boolean
            saveObservable = this._communicationService.createCommunication$(communicationToSave).pipe(
              tap((communicationGuid) => {
                this.communicationGuid = communicationGuid;
              }),
              map((communicationGuid) => communicationGuid !== ''),
            );
          } else {
            // Update the communication and then update the status
            saveObservable = this._communicationService.updateCommunication$(communicationToSave).pipe(
              switchMap((success) => {
                if (!success) {
                  return of(false);
                }
                
                return this._communicationService.updateStatus$(communicationToSave, communicationToSave.statusId ?? 0);
              }),
            );
          }
          break;
        }
        case CommunicationAddEditStep.AccountTargets: {
          const communicationToSave = this._convertAccountTargetFormValuesToCommunication();
          saveObservable = this._communicationService.updateAccountTargets$(communicationToSave);
          break;
        }
        case CommunicationAddEditStep.UserTargets: {
          const communicationToSave = this._convertUserTargetFormValuesToCommunication();
          saveObservable = this._communicationService.updateUserTargets$(communicationToSave);
          break;
        }
        case CommunicationAddEditStep.Translation: {
          // There is nothing to-do as a 'top-level' save for the translation step, so always return a successful observable
          saveObservable = of(true);
          break;
        }
      }
    }

    return saveObservable.pipe(untilDestroyed(this));
  }

  public onSave(): void {
    this.isFormLoading = true;
    this._getCommunicationSaveObservable().subscribe((success: boolean) => {
      this.isFormLoading = false;
      if (success) {
        this._polarisNotificationService.success(this._translate.instant('notification.saved.success'));
        if (this.currentStepId === CommunicationAddEditStep.Message && !this._isEditMode) {
          // Add the communicationGuid to the URL if we are in Add mode
          // Allows the page to be refreshed and still be working on the created communication
          this._router.navigate([Route.CommunicationAdd, this.communicationGuid, CommunicationAddEditStep.Message]);
        } else if (this.communicationGuid) {
          // Grab the latest server side communication data after a save
          this._communicationService
            .getCommunication$(this.communicationGuid)
            .pipe(untilDestroyed(this))
            .subscribe((communication) => {
              this.communication = communication;
            });
        }
        this.currentFormGroup.markAsPristine();
      } else {
        this._polarisNotificationService.danger(this._translate.instant('notification.saved.failed'));
      }
    });
  }

  public onContinue(): void {
    this.isFormLoading = true;
    // Show a confirmation dialog if the user is skipping translation
    if (this.currentStepId === CommunicationAddEditStep.Translation) {
      const draftStatus = this._communicationStatuses.find(
        (status) => status.name === CommunicationStatusType.Draft,
      )?.statusId;

      const isDraft = this.communication?.statusId === draftStatus;
      // All communications have a single translation in the default language, so check > 1
      const hasTranslations = this.currentFormGroup.get('translations')?.value.length > 1;

      if (isDraft && !hasTranslations) {
        // Alert the user that they are skipping translation
        this._polarisDialogService
          .open(StandardDialogComponent, {
            minWidth: '25dvh',
            maxWidth: '50dvh',
            data: {
              title: 'dialog.skip-translation.title',
              message: 'dialog.skip-translation.message',
              primaryButtonLabel: 'skip',
              secondaryButtonLabel: 'go-back',
            },
          })
          .pipe(untilDestroyed(this))
          .subscribe((confirmed) => {
            this.isFormLoading = false;
            if (confirmed) {
              this._navigateToNextStep();
            }
          });

        // Don't proceed with the regular saving and navigation logic, defer to the dialog close for if we navigate to the next step
        return;
      }

      // Check for unsaved changes in the translation form
      if (this._hasTranslationFormChanges) {
        this._showPendingChangesDialog().subscribe((confirmed) => {
          this.isFormLoading = false;

          if (confirmed) {
            this._navigateToNextStep();
          }
        });

        // Don't proceed with the regular saving and navigation logic, defer to the dialog close for if we navigate to the next step
        return;
      }
    }

    // Skip saving if nothing in the current form has changed and we are in edit mode
    if (this.currentFormGroup.pristine && this._isEditMode) {
      this._navigateToNextStep();
      this.isFormLoading = false;
    } else {
      this._getCommunicationSaveObservable().subscribe((success: boolean) => {
        this.isFormLoading = false;
        if (success) {
          this._navigateToNextStep();
        } else {
          this._polarisNotificationService.danger(this._translate.instant('notification.saved.failed'));
        }
      });
    }
  }

  private _showPendingChangesDialog(): Observable<boolean> {
    return this._polarisDialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.discard-unsaved-changes.title',
          message: 'dialog.discard-unsaved-changes.message',
          primaryButtonLabel: 'proceed',
          secondaryButtonLabel: 'go-back',
        },
      })
      .pipe(untilDestroyed(this));
  }

  public onPublish(): void {
    if (this.communication?.communicationGuid && this.allSectionsValid) {
      this.isFormLoading = true;
      this._lookupService
        .getStatusByName$(CommunicationStatusType.Active)
        .pipe(
          untilDestroyed(this),
          switchMap((activeStatus: CommunicationStatus | undefined) => {
            if (!activeStatus) {
              throw new Error('Communication status not found.');
            }

            return this._communicationService.updateStatus$(this.communication as Communication, activeStatus.statusId);
          }),
          tap((success: boolean) => {
            if (success) {
              this._polarisNotificationService.success(this._translate.instant('notification.publish.success'));
              this._router.navigate([Route.CommunicationConfirmation, this.communicationGuid]);
            } else {
              this._polarisNotificationService.danger(this._translate.instant('notification.publish.failed'));
            }
          }),
          catchError(() => {
            this._polarisNotificationService.danger(this._translate.instant('notification.publish.failed'));

            return of(false);
          }),
          finalize(() => {
            this.isFormLoading = false;
          }),
        )
        .subscribe();
    }
  }

  public onAccountTargetsChanged(accounts: DealerAccountListingVm[]): void {
    if (this.communication && this.communicationGuid) {
      this.communication.accounts = accounts.map((account: DealerAccountListingVm) =>
        account.toCommunicationAccountEntity(this.communicationGuid as string),
      );
    }
  }

  private _navigateToNextStep(): void {
    let nextStep: string = '';
    switch (this.currentStepId) {
      case CommunicationAddEditStep.Message:
        nextStep = CommunicationAddEditStep.AccountTargets;
        // In the case we are on the base Add Message route with no communicationGuid, append the communicationGuid to the next step
        // It's possible to have a communicationGuid in the URL and be in Add mode if the user is in the Add flow and navigates back from the next step
        if (!this._isEditMode && !this._route.snapshot.paramMap.get('communicationGuid')) {
          nextStep = `${this.communicationGuid}/` + nextStep;
        }
        break;
      case CommunicationAddEditStep.AccountTargets:
        nextStep = CommunicationAddEditStep.UserTargets;
        break;
      case CommunicationAddEditStep.UserTargets:
        nextStep = CommunicationAddEditStep.Translation;
        break;
      case CommunicationAddEditStep.Translation:
        nextStep = CommunicationAddEditStep.Review;
        break;
    }

    const currentStepId: string = this.currentStepId?.toString() ?? '';
    this._router.navigateByUrl(this._router.url.replace(currentStepId, nextStep));
  }

  public onNavigateToStep(toStep: FormStep): void {
    if (
      this.currentStepId === CommunicationAddEditStep.Message ||
      this.currentStepId === CommunicationAddEditStep.AccountTargets
    ) {
      // Show a confirmation dialog if the user is skipping the Account Targets section via the stepper
      const accountTargetsStepIndex = this.formSteps.findIndex(
        (step) => step.id === CommunicationAddEditStep.AccountTargets,
      );
      const toStepIndex = this.formSteps.findIndex((step) => step.id === toStep.id);

      const isSkippingAccountTargets = toStepIndex > accountTargetsStepIndex;
      if (isSkippingAccountTargets && !this.isAccountTargetsSectionValid(this.communication)) {
        this._polarisDialogService
          .open(StandardDialogComponent, {
            minWidth: '25dvh',
            maxWidth: '50dvh',
            data: {
              title: 'dialog.account-target-required.title',
              htmlMessage: 'dialog.account-target-required.message',
              primaryButtonLabel: 'proceed',
              secondaryButtonLabel: 'cancel',
            },
          })
          .pipe(untilDestroyed(this))
          .subscribe((confirmed) => {
            if (confirmed) {
              this._router.navigate([toStep.link]);
            }
          });
      } else {
        this._router.navigate([toStep.link]);
      }
    } else if (this.currentStepId === CommunicationAddEditStep.Translation && this.hasUnsavedChanges()) {
      this._showPendingChangesDialog().subscribe((confirmed) => {
        if (confirmed) {
          this._router.navigate([toStep.link]);
        }
      });
    } else {
      this._router.navigate([toStep.link]);
    }
  }

  public onCancel(): void {
    this._router.navigateByUrl(Route.Communications);
  }

  public onBack(): void {
    let previousStep: string = '';
    switch (this.currentStepId) {
      case CommunicationAddEditStep.AccountTargets:
        previousStep = CommunicationAddEditStep.Message;
        break;
      case CommunicationAddEditStep.UserTargets:
        previousStep = CommunicationAddEditStep.AccountTargets;
        break;
      case CommunicationAddEditStep.Translation:
        previousStep = CommunicationAddEditStep.UserTargets;
        break;
      case CommunicationAddEditStep.Review:
        previousStep = CommunicationAddEditStep.Translation;
        break;
    }

    const currentStepId: string = this.currentStepId?.toString() ?? '';
    this._router.navigateByUrl(this._router.url.replace(currentStepId, previousStep));
  }

  public get currentFormGroup(): FormGroup {
    switch (this.currentStepId) {
      case CommunicationAddEditStep.Message:
        return this.communicationFormGroup.get('message') as FormGroup;
      case CommunicationAddEditStep.AccountTargets:
        return this.communicationFormGroup.get('accountTargets') as FormGroup;
      case CommunicationAddEditStep.UserTargets:
        return this.communicationFormGroup.get('userTargets') as FormGroup;
      case CommunicationAddEditStep.Translation:
        return this.communicationFormGroup.get('translations') as FormGroup;
      case CommunicationAddEditStep.Review:
        return this.communicationFormGroup.get('review') as FormGroup;
      default:
        return this.communicationFormGroup;
    }
  }

  public get currentStepIndex(): number {
    return this.formSteps.findIndex((step) => step.id === this.currentStepId);
  }

  public get isFirstStep(): boolean {
    return this.currentStepId === CommunicationAddEditStep.Message;
  }

  public get isLastStep(): boolean {
    return this.currentStepId === CommunicationAddEditStep.Review;
  }

  public get disableContinue(): boolean {
    return this.currentFormGroup.invalid || this.isFormLoading || this._isChildFormLoading;
  }

  public get disableSave(): boolean {
    return (
      this.currentFormGroup.invalid || this.currentFormGroup.pristine || this.isFormLoading || this._isChildFormLoading
    );
  }

  public get disablePublish(): boolean {
    return this.isFormLoading || this._isChildFormLoading || !this.allSectionsValid;
  }

  public get disableCancel(): boolean {
    return this.isFormLoading || this._isChildFormLoading;
  }

  public onChildLoadingChange(isLoading: boolean): void {
    this._isChildFormLoading = isLoading;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * Handles form change events from child components.
   * @param hasChanges - A boolean indicating whether the child form has pending changes
   */
  public onChildFormChange(hasChanges: boolean): void {
    if (this.currentStepId === CommunicationAddEditStep.Translation) {
      this._hasTranslationFormChanges = hasChanges;
    }
  }

  private _convertMessageFormValuesToCommunication(): Communication {
    const messageFormValues = this.communicationFormGroup.value.message;

    return new Communication({
      communicationGuid: this.communicationGuid ?? undefined,
      statusId: messageFormValues.communicationStatus,
      groupId: messageFormValues.group,
      subGroupId: messageFormValues.subGroup !== -1 ? messageFormValues.subGroup : undefined,
      defaultMessage: new CommunicationMessage({
        messageId: this.communication?.defaultMessage?.messageId ?? undefined,
        cultureCode: messageFormValues.defaultLanguage,
        title: messageFormValues.title,
        messageBody: messageFormValues.message,
        keywords: messageFormValues.keywords,
        internalNotes: messageFormValues.internalNotes,
        statusId: messageFormValues.messageStatus,
      }),
      startDate: this._datetimeService.getUtcOffsetTimestamp(
        messageFormValues.startDate,
        messageFormValues.startTime,
        messageFormValues.timezone,
      ),
      endDate: this._datetimeService.getUtcOffsetTimestamp(
        messageFormValues.endDate,
        messageFormValues.endTime,
        messageFormValues.timezone,
      ),
    });
  }

  private _convertAccountTargetFormValuesToCommunication(): Communication {
    const accountTargetFormValues = this.communicationFormGroup.value.accountTargets;

    let partnerTypes: CommunicationCode[] = [];
    if (accountTargetFormValues.partnerTypeSelected) {
      partnerTypes = Object.keys(accountTargetFormValues.partnerTypeOptions)
        .filter((key) => accountTargetFormValues.partnerTypeOptions[key])
        .map((partnerTypeCode: string): CommunicationCode => new CommunicationCode({ code: partnerTypeCode }));
    }

    let productLines: CommunicationCode[] = [];
    if (accountTargetFormValues.productLineSelected) {
      productLines = Object.keys(accountTargetFormValues.productLineOptions)
        .filter((key) => key !== 'productLinesSelectAll' && accountTargetFormValues.productLineOptions[key])
        .map((productLineCode: string): CommunicationCode => new CommunicationCode({ code: productLineCode }));
    }

    let customerClasses: CommunicationCode[] = [];
    if (accountTargetFormValues.customerClassSelected) {
      customerClasses = Object.keys(accountTargetFormValues.customerClassOptions)
        .filter((key) => key !== 'customerClassSelectAll' && accountTargetFormValues.customerClassOptions[key])
        .map((classCode: string): CommunicationCode => new CommunicationCode({ code: classCode }));
    }

    let countries: CommunicationCode[] = [];
    if (accountTargetFormValues.countrySelected) {
      countries = accountTargetFormValues.countryOptions.map((countryCode: string) => ({
        code: countryCode,
      }));
    }

    let stateOrProvinces: CommunicationCode[] = [];
    if (accountTargetFormValues.stateOrProvinceSelected) {
      stateOrProvinces = accountTargetFormValues.stateOrProvinceOptions.map((stateOrProvinceCode: string) => ({
        code: stateOrProvinceCode,
      }));
    }

    let accounts: CommunicationAccount[] = [];
    if (accountTargetFormValues.specificAccountSelected && this.communicationGuid) {
      accounts = accountTargetFormValues.specificAccountOptions.map((account: DealerAccountListingVm) =>
        account.toCommunicationAccountEntity(this.communicationGuid as string),
      );
    }

    let parentAccounts: CommunicationAccount[] = [];
    if (accountTargetFormValues.parentAccountsOptions && this.communicationGuid) {
      const dealerNumbers = Array.from(
        new Set(Object.values(accountTargetFormValues.parentAccountsOptions).flat() as string[]),
      );

      parentAccounts = dealerNumbers.map(
        (dealerNumber) =>
          new CommunicationAccount({
            number: dealerNumber,
          }),
      );
    }

    let territories: CommunicationCode[] = [];
    if (accountTargetFormValues.salesTerritoryOrRegionSelected) {
      territories = accountTargetFormValues.salesTerritoryOrRegionOptions.map(
        (code: string) => new CommunicationCode({ code }),
      );
    }

    return new Communication({
      communicationGuid: this.communicationGuid ?? undefined,
      partnerTypes,
      productLines,
      custClasses: customerClasses,
      countries,
      stateOrProvinces,
      accounts,
      parentAccounts,
      territories,
    });
  }

  private _convertUserTargetFormValuesToCommunication(): Communication {
    const userTargetFormValues = this.communicationFormGroup.value.userTargets;

    let departments: CommunicationCode[] = [];
    if (userTargetFormValues.departmentSelected) {
      departments = Object.keys(userTargetFormValues.departmentOptions)
        .filter((key) => userTargetFormValues.departmentOptions[key])
        .map((departmentCode: string): CommunicationCode => new CommunicationCode({ code: departmentCode }));
    }

    let staffRoles: CommunicationCode[] = [];
    if (userTargetFormValues.staffRoleSelected) {
      staffRoles = Object.keys(userTargetFormValues.staffRoleOptions)
        .filter((key) => userTargetFormValues.staffRoleOptions[key])
        .map((staffRoleCode: string): CommunicationCode => new CommunicationCode({ code: staffRoleCode }));
    }

    let serviceStaffRoles: CommunicationCode[] = [];
    if (userTargetFormValues.serviceStaffRoleSelected) {
      serviceStaffRoles = Object.keys(userTargetFormValues.serviceStaffRoleOptions)
        .filter((key) => userTargetFormValues.serviceStaffRoleOptions[key])
        .map(
          (serviceStaffRoleCode: string): CommunicationCode => new CommunicationCode({ code: serviceStaffRoleCode }),
        );
    }

    let userAccounts: CommunicationAccount[] = [];
    if (userTargetFormValues.specificAccountSelected && this.communicationGuid) {
      userAccounts = userTargetFormValues.specificAccountOptions.map((account: UserAccountListingVm) =>
        account.toCommunicationUserAccountEntity(this.communicationGuid as string),
      );
    }

    let applications: CommunicationApplication[] = [];
    if (userTargetFormValues.securityOrAppPermissionsSelected) {
      applications = userTargetFormValues.securityOrAppPermissionsSelectedResults;
    }

    return new Communication({
      communicationGuid: this.communicationGuid ?? undefined,
      departments,
      roles: staffRoles,
      serviceStaffRoles,
      applications,
      userAccounts,
    });
  }

  public isAccountTargetsSectionValid(communication: Communication | undefined = this.communication): boolean {
    if (!communication) {
      return false;
    }
    const hasProductLines = Array.isArray(communication.productLines) && communication.productLines.length > 0;

    const hasPartnerTypes = Array.isArray(communication.partnerTypes) && communication.partnerTypes.length > 0;
    const hasCustomerClasses = Array.isArray(communication.custClasses) && communication.custClasses.length > 0;
    const hasTerritories = Array.isArray(communication.territories) && communication.territories.length > 0;
    const hasCountries = Array.isArray(communication.countries) && communication.countries.length > 0;
    const hasStatesOrProvinces =
      Array.isArray(communication.stateOrProvinces) && communication.stateOrProvinces.length > 0;
    const hasAccounts = Array.isArray(communication.accounts) && communication.accounts.length > 0;
    const hasParentAccounts = Array.isArray(communication.parentAccounts) && communication.parentAccounts.length > 0;

    const hasGeneralTarget =
      hasPartnerTypes ||
      hasProductLines ||
      hasCustomerClasses ||
      hasTerritories ||
      hasCountries ||
      hasStatesOrProvinces ||
      hasParentAccounts;
    const hasSpecificTarget = hasAccounts;

    return hasProductLines && (hasGeneralTarget || hasSpecificTarget);
  }

  public areAllSectionsValid(communication: Communication | undefined = this.communication): boolean {
    return this.isAccountTargetsSectionValid(communication);
  }

  public get allSectionsValid(): boolean {
    return this._allSectionsValid;
  }

  /**
   * Checks if the current step has any unsaved changes that should be confirmed before navigating away
   * @returns boolean indicating whether there are unsaved changes
   */
  public hasUnsavedChanges(): boolean {
    if (this.currentStepId === CommunicationAddEditStep.Translation) {
      return this._hasTranslationFormChanges;
    }

    return this.currentFormGroup.dirty;
  }
}
