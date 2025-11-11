import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisDatePicker,
  PolarisDialogService,
  PolarisFilePicker,
  PolarisHref,
  PolarisFilePickerFile,
  PolarisFilePickerFileExtension,
  PolarisFilePickerStatus,
  PolarisGroupOption,
  PolarisIcon,
  PolarisInput,
  PolarisLoader,
  PolarisNotificationService,
  PolarisRadioGroup,
  PolarisRichTextEditor,
  PolarisSelect,
  PolarisTimePicker,
  PolarisIconButton,
} from '@dealer-portal/polaris-ui';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LookupService } from '@services/lookup/lookup.service';
import { map } from 'rxjs';
import {
  CommunicationStatusType,
  CommunicationsApiService,
  CoreService,
  PolarisTime,
  CommunicationAttachment,
  Communication,
} from '@dealer-portal/polaris-core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CommunicationAddEditTargetsBase } from '@classes';
import { CommunicationsService } from '@services/communications/communications.service';
import { TooltipService } from '../../services/tooltip/tooltip.service';
import { TimezoneService } from '@services/timezone/timezone.service';

@UntilDestroy()
@Component({
  selector: 'ca-communication-add-edit-message',
  imports: [
    CommonModule,
    PolarisIcon,
    PolarisHref,
    ReactiveFormsModule,
    PolarisRadioGroup,
    PolarisDatePicker,
    PolarisTimePicker,
    PolarisInput,
    PolarisLoader,
    PolarisSelect,
    TranslatePipe,
    PolarisRichTextEditor,
    PolarisFilePicker,
    PolarisIconButton,
  ],
  templateUrl: './communication-add-edit-message.component.html',
  styleUrl: './communication-add-edit-message.component.scss',
})
export class CommunicationAddEditMessageComponent extends CommunicationAddEditTargetsBase implements OnInit {
  @Input() communication?: Communication | null;
  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  public messageFormGroup!: FormGroup;

  public communicationStatusOptions: PolarisGroupOption<number>[] = [];
  public communicationGroupOptions: PolarisGroupOption<number>[] = [];
  public communicationSubGroupOptions: PolarisGroupOption<number>[] = [];
  public languageOptions: PolarisGroupOption<string>[] = [];
  public timezoneOptions: PolarisGroupOption<number>[] = [];
  public uploadFiles: PolarisFilePickerFile[] = [];
  public filePickerFormControl: FormControl = new FormControl();
  public allowedFileTypes: PolarisFilePickerFileExtension[] = [
    PolarisFilePickerFileExtension.DOC,
    PolarisFilePickerFileExtension.DOCX,
    PolarisFilePickerFileExtension.MP4,
    PolarisFilePickerFileExtension.PDF,
    PolarisFilePickerFileExtension.TXT,
    PolarisFilePickerFileExtension.XLS,
    PolarisFilePickerFileExtension.XLSX,
  ];
  public maxAttachmentSize: number = 1 * 1024 * 1024 * 1024; // 1 GB

  public isLoadingLanguages: boolean = false;
  public isLoadingGroups: boolean = false;
  public isLoadingSubGroups: boolean = false;
  public isLoadingStatuses: boolean = false;

  constructor(
    private _coreService: CoreService,
    private _rootFormGroup: FormGroupDirective,
    private _lookupService: LookupService,
    private _communicationsApiService: CommunicationsApiService,
    private _communicationsService: CommunicationsService,
    private _timezoneService: TimezoneService,
    protected override _notificationService: PolarisNotificationService,
    protected override _translate: TranslateService,
    protected override _polarisDialogService: PolarisDialogService,
    public toolTipService: TooltipService,
  ) {
    super(_polarisDialogService, _notificationService, _translate);
  }

  public ngOnInit(): void {
    this.messageFormGroup = this._rootFormGroup.control.controls['message'] as FormGroup;

    this.messageFormGroup.addValidators(this._startDateBeforeEndDateValidator());
    this.messageFormGroup.updateValueAndValidity();
    this.isLoadingStatuses = true;
    this.isLoadingGroups = true;
    this.isLoadingLanguages = true;
    this._updateFormLoadingState();

    const messageStatusControl = this.messageFormGroup.get('messageStatus');
    messageStatusControl?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.onSelectStatus(value);
      }
    });

    const groupControl = this.messageFormGroup.get('group');
    groupControl?.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this.onSelectGroup(value);
    });

    // Default language cannot be edited once the communication is created
    // Disable the default language control if we are editing a communication
    if (this.communication) {
      this.messageFormGroup.get('defaultLanguage')?.disable();
    }

    this._getLanguageOptions();
    this._getTimezoneOptions();
    this._getSettingsOptions();
    this._getAttachmentLinks();
  }

  private _updateFormLoadingState(): void {
    this.loadingChange.emit(this.isLoading || this.isLoadingSubGroups);
  }

  private _getLanguageOptions(): void {
    this._coreService
      .getCoreData$({ languages: true })
      .pipe(untilDestroyed(this))
      .subscribe((coreData) => {
        this.languageOptions = coreData.languages.map(
          (language) =>
            new PolarisGroupOption<string>({
              value: language.cultureCode,
              label: `${language.name} (${language.cultureCode.toLocaleUpperCase()})`,
            }),
        );

        this.isLoadingLanguages = false;
        this._updateFormLoadingState();
      });
  }

  private _getTimezoneOptions(): void {
    this.timezoneOptions = this._timezoneService.getTimezoneOptions().map(
      (timezone) =>
        new PolarisGroupOption<number>({
          value: timezone.offset,
          label: timezone.label,
        }),
    );
  }

  private _getSettingsOptions(): void {
    // Fetch Status options
    this._lookupService
      .getStatuses$()
      .pipe(
        map((statuses) => {
          // Get the current status of the overall communication
          let communicationStatus = statuses.find(
            (status) => status.statusId === this.messageFormGroup.get('communicationStatus')?.value,
          );
          // Default the overall communication to draft status if no status is found
          if (!communicationStatus) {
            communicationStatus = statuses.find((status) => status.name === CommunicationStatusType.Draft);
            this.messageFormGroup.get('communicationStatus')?.setValue(communicationStatus?.statusId);
          }

          const isPublished =
            communicationStatus?.name === CommunicationStatusType.Active ||
            communicationStatus?.name === CommunicationStatusType.Inactive;

          // If the overall communication status is Active or Inactive, only allow those to be displayed for selection for the default message
          if (isPublished) {
            statuses = statuses.filter(
              (status) =>
                status.name === CommunicationStatusType.Active || status.name === CommunicationStatusType.Inactive,
            );
          } else {
            // The individual communication message status should default to active if the overall communication is not published
            this.messageFormGroup
              .get('messageStatus')
              ?.setValue(statuses.find((status) => status.name === CommunicationStatusType.Active)?.statusId);
          }

          return statuses.map((status) => {
            return new PolarisGroupOption<number>({
              value: status.statusId,
              label: status.name,
              selected:
                (isPublished && status.statusId === this.messageFormGroup.get('messageStatus')?.value) ||
                (!isPublished && status.name === CommunicationStatusType.Draft),
              disabled: !isPublished && status.name !== CommunicationStatusType.Draft,
            });
          });
        }),
        untilDestroyed(this),
      )
      .subscribe((statusOptions) => {
        this.communicationStatusOptions = statusOptions;
        this.isLoadingStatuses = false;
        this._updateFormLoadingState();
      });

    // Fetch Group options
    this._lookupService
      .getGroups$()
      .pipe(
        map((groups) => {
          return groups.map((group) => {
            return new PolarisGroupOption<number>({
              value: group.groupId,
              label: group.name,
            });
          });
        }),
        untilDestroyed(this),
      )
      .subscribe((groupOptions) => {
        this.communicationGroupOptions = groupOptions;
        this.isLoadingGroups = false;
        this._updateFormLoadingState();
      });

    // Fetch Sub-Group options if a group is already selected (i.e. Edit Mode)
    const currentGroupValue = this.messageFormGroup.get('group')?.value;
    if (currentGroupValue) {
      this._buildSubGroupValues(currentGroupValue);
    }
  }

  private _buildSubGroupValues(groupId: number): void {
    const noneOption = new PolarisGroupOption<number>({
      value: -1,
      label: this._translate.instant('sub-group-option.none'),
    });
    this.communicationSubGroupOptions = [noneOption];

    // Set the Sub-Group to None if it is not already set, to account for the initial load in Edit mode
    const currentSubGroupValue = this.messageFormGroup.get('subGroup')?.value;
    if (!currentSubGroupValue) {
      this.messageFormGroup.get('subGroup')?.setValue(noneOption.value);
    }

    // Fetch Sub-Group options
    this.isLoadingSubGroups = true;
    this._updateFormLoadingState();

    this._lookupService
      .getSubGroups$(groupId)
      .pipe(
        map((subGroups) => {
          return subGroups.map((subGroup) => {
            return new PolarisGroupOption<number>({
              value: subGroup.subGroupId,
              label: subGroup.name,
            });
          });
        }),
        untilDestroyed(this),
      )
      .subscribe((groupOptions) => {
        this.communicationSubGroupOptions = [...this.communicationSubGroupOptions, ...groupOptions];
        this.isLoadingSubGroups = false;
        this._updateFormLoadingState();
      });
  }

  public onSelectStatus(statusId: number): void {
    // Determine if the communication is published or not, if it is the overall status will mirror the default communication's status
    this._lookupService
      .getStatuses$()
      .pipe(
        map((statuses) => {
          // Get the current status of the overall communication
          const communicationStatus = statuses.find(
            (status) => status.statusId === this.messageFormGroup.get('communicationStatus')?.value,
          );

          const isPublished =
            communicationStatus?.name === CommunicationStatusType.Active ||
            communicationStatus?.name === CommunicationStatusType.Inactive;

          if (isPublished) {
            this.messageFormGroup.get('communicationStatus')?.setValue(statusId);
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  public onSelectGroup(groupId: number): void {
    // Clear the subgroup options and any selected sub-group option
    this.communicationSubGroupOptions = [];
    this.messageFormGroup.controls['subGroup'].reset();

    this._buildSubGroupValues(groupId);
  }

  public onUploadAttachments(files: File[]): void {
    if (this.handleFilePickerErrors(this.filePickerFormControl)) {
      return;
    }

    if (!this.communication) {
      return;
    }

    const existingAttachments: CommunicationAttachment[] = this.messageFormGroup.get('attachments')?.value ?? [];

    // Create a Set of file names that are already uploaded or are uploading in the file picker
    const unavailableFileNames = new Set([
      ...existingAttachments.map((attachment) => attachment.name).filter((name): name is string => name !== undefined),
      ...this.uploadFiles
        .filter((upload) => upload.status === PolarisFilePickerStatus.Uploading)
        .map((upload) => upload.name),
    ]);

    // Determine new and duplicate attachments based on the unavailable file names
    const { newAttachments, duplicateAttachments } = files.reduce<{
      newAttachments: File[];
      duplicateAttachments: File[];
    }>(
      (accumulator, file) => {
        if (unavailableFileNames.has(file.name)) {
          accumulator.duplicateAttachments.push(file);
        } else {
          accumulator.newAttachments.push(file);
        }

        return accumulator;
      },
      { newAttachments: [], duplicateAttachments: [] },
    );

    // Show a warning if there are any duplicate attachments
    if (duplicateAttachments.length > 0) {
      const duplicateAttachmentNames = duplicateAttachments.map((file) => file.name).join(', ');
      this._notificationService.warning(
        this._translate.instant('notification.attachment-add.warning', { fileNames: duplicateAttachmentNames }),
        { duration: 7000 },
      );
    }

    // If all attachments were duplicates, exit early
    if (newAttachments.length === 0) {
      return;
    }

    // Create a Set of names for the new attachments to avoid duplicates in the file picker
    const newAttachmentsNames = new Set(newAttachments.map((file) => file.name));

    // Remove any existing file picker uploads that will be replaced with new attachments uploads
    this.uploadFiles = this.uploadFiles.filter((upload) => !newAttachmentsNames.has(upload.name));

    // Create a file picker upload for each new attachment
    const newFileUploads: PolarisFilePickerFile[] = newAttachments.map((attachment: File): PolarisFilePickerFile => {
      return {
        id: attachment.name,
        name: attachment.name,
        status: PolarisFilePickerStatus.Uploading,
        progress: 'indeterminate',
      };
    });

    // Update the displayed file picker uploaded files
    this.uploadFiles = [...this.uploadFiles, ...newFileUploads];

    newAttachments.forEach((attachment) => {
      this._communicationsService
        .uploadAttachment$(
          new Communication({ ...this.communication }),
          this.messageFormGroup.get('defaultLanguage')?.value,
          attachment,
        )
        .pipe(untilDestroyed(this))
        .subscribe((updatedMessage) => {
          let uploadStatus = PolarisFilePickerStatus.Success;
          if (updatedMessage && updatedMessage.attachments?.length) {
            // Update this specific message in the translations
            this.messageFormGroup.get('attachments')?.setValue(updatedMessage.attachments ?? []);
            this._getAttachmentLinks();
          } else {
            uploadStatus = PolarisFilePickerStatus.Error;
            this._notificationService.danger(
              this._translate.instant('notification.attachment-add.failed', {
                fileName: attachment.name,
              }),
            );
          }

          // Update the UI status of the file upload
          const fileUpload = this.uploadFiles.find((upload: PolarisFilePickerFile) => {
            return upload.name === attachment.name;
          });
          if (fileUpload) {
            fileUpload.status = uploadStatus;
            fileUpload.progress = 100;
          }
        });
    });
  }

  public onDeleteAttachment(attachment: CommunicationAttachment) {
    this._communicationsService
      .deleteAttachment$(
        new Communication({ ...this.communication }),
        this.messageFormGroup.get('defaultLanguage')?.value,
        attachment,
      )
      .pipe(untilDestroyed(this))
      .subscribe((updatedMessage) => {
        if (updatedMessage) {
          this.messageFormGroup.get('attachments')?.setValue(updatedMessage.attachments ?? []);
        } else {
          this._notificationService.danger(
            this._translate.instant('notification.attachment-delete.failed', {
              fileName: attachment.name,
            }),
          );
        }
      });
  }

  public onClearFileUpload(clearedFile: PolarisFilePickerFile): void {
    if (clearedFile.status === PolarisFilePickerStatus.Uploading) {
      // Do not allow clearing files that are currently uploading
      return;
    }
    this.uploadFiles = this.uploadFiles.filter((uploadFile) => uploadFile.name !== clearedFile.name);
  }

  private _getAttachmentLinks() {
    if (!this.communication) return;

    this._communicationsService
      .getAttachments$(new Communication({ ...this.communication }))
      .pipe(untilDestroyed(this))
      .subscribe((attachments) => {
        if (attachments?.messages) {
          const defaultReadableMessage = attachments.messages.find(
            (message) => message.messageId === this.communication?.defaultMessage?.messageId,
          );

          if (defaultReadableMessage) {
            this.messageFormGroup.get('attachments')?.value?.forEach((attachment: CommunicationAttachment) => {
              const matchingAttachment = defaultReadableMessage.fileAttachments?.find(
                (item) => item.attachmentId === attachment.attachmentId,
              );
              if (matchingAttachment) {
                attachment.location = matchingAttachment.url;
              }
            });
          }
        }
      });
  }

  private _startDateBeforeEndDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDate: Date = control.get('startDate')?.value;
      const endDate: Date = control.get('endDate')?.value;
      const startTime: PolarisTime = control.get('startTime')?.value;
      const endTime: PolarisTime = control.get('endTime')?.value;

      if (startDate && endDate) {
        // Strip the time from the dates since we only care about the day, month, and year when comparing
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        if (startDateOnly > endDateOnly) {
          return { startDateAfterEndDate: true };
        }

        if (startDateOnly.getTime() === endDateOnly.getTime()) {
          if (startTime && endTime && !this._isStartTimeBeforeEndTime(startTime, endTime)) {
            return { startTimeAfterEndTime: true };
          }
        }

        // End Date must be greater than or equal to today if the communication is not in draft status
        const communicationStatus = control.get('communicationStatus')?.value;
        const today = new Date();
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const draftStatusCode = this.communicationStatusOptions.find(
          (option) => option.label === CommunicationStatusType.Draft.toString(),
        )?.value;
        if (communicationStatus === draftStatusCode && endDateOnly <= todayOnly) {
          return { endDateBeforeTodayInDraft: true };
        }
      }

      return null;
    };
  }

  private _isStartTimeBeforeEndTime(startTime: PolarisTime, endTime: PolarisTime): boolean {
    if (startTime.period === endTime.period) {
      // Use % 12, since 12 is less than 1-11 in 12 hour time in the same period
      if (startTime.hours % 12 < endTime.hours % 12) {
        return true;
      } else if (startTime.hours === endTime.hours) {
        return startTime.minutes <= endTime.minutes;
      } else {
        return false;
      }
    } else {
      return startTime.period === 'AM';
    }
  }

  public get isLoading() {
    return this.isLoadingLanguages || this.isLoadingGroups || this.isLoadingStatuses;
  }
}
