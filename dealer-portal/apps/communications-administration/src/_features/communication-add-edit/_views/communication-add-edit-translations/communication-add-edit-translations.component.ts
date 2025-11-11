import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PolarisButton,
  PolarisCheckboxGroup,
  PolarisExpansionPanel,
  PolarisGroupOption,
  PolarisIcon,
  PolarisInput,
  PolarisLoader,
  PolarisSelect,
  PolarisRichTextEditor,
  PolarisIconButton,
  PolarisDialogService,
  PolarisNotificationService,
  PolarisFilePicker,
  PolarisFilePickerFile,
  PolarisFilePickerStatus,
  PolarisFilePickerFileExtension,
} from '@dealer-portal/polaris-ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AutoTranslateService,
  Communication,
  CommunicationAttachment,
  CommunicationMessage,
  CommunicationStatus,
  CommunicationStatusType,
  CoreService,
  Language,
  TranslationContentType,
} from '@dealer-portal/polaris-core';
import { CommunicationsService } from '@services/communications/communications.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LookupService } from '@services/lookup/lookup.service';
import { Observable, forkJoin, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { RichTextViewerComponent } from '@components/rich-text-viewer/rich-text-viewer.component';
import { ActivatedRoute } from '@angular/router';
import { TranslationSavedDialogComponent } from '@features/communication-add-edit/_components/translation-saved-dialog/translation-saved-dialog.component';
import { StandardDialogComponent } from '../../_components/standard-dialog/standard-dialog.component';
import { CommunicationTranslation } from '@classes';

@UntilDestroy()
@Component({
  selector: 'ca-communication-add-edit-translations',
  imports: [
    CommonModule,
    PolarisLoader,
    TranslatePipe,
    PolarisSelect,
    PolarisInput,
    PolarisButton,
    PolarisExpansionPanel,
    PolarisCheckboxGroup,
    PolarisIcon,
    ReactiveFormsModule,
    PolarisRichTextEditor,
    PolarisIconButton,
    RichTextViewerComponent,
    PolarisFilePicker,
  ],
  templateUrl: './communication-add-edit-translations.component.html',
  styleUrl: './communication-add-edit-translations.component.scss',
})
export class CommunicationAddEditTranslationsComponent implements OnInit {
  @Input() communication?: Communication;

  @Output() loadingChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() formChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  // Used to scroll the form into view when editing a translation
  @ViewChild('translationFormElement') translationFormElement?: ElementRef<HTMLDivElement>;

  // Parent FormGroup Variables
  public allTranslationsFormControl!: FormControl<CommunicationMessage[]>;

  // Component Add/Edit Form Variables
  public translationAddEditFormGroup!: FormGroup<{
    language: FormControl<string | null>;
    title: FormControl<string | null>;
    message: FormControl<string | null>;
    confirmation: FormGroup<{ acknowledge: FormControl<boolean | null> }>;
  }>;
  public translationAttachmentsFormGroup!: FormGroup<Record<string, AbstractControl<PolarisFilePickerFile[]>>>;
  public allLanguageSelectOptions: PolarisGroupOption<string>[] = [];
  public confirmationFormControl!: FormControl;
  public confirmationOption: PolarisGroupOption<boolean> = new PolarisGroupOption<boolean>({
    formControlName: 'acknowledge',
    label: this._translate.instant('acknowledgement-approval'),
  });

  public activeStatusId?: number;

  // Signal to store all available languages
  private _allLanguagesSignal = signal<Language[]>([]);

  // Signal for the default translation
  private _defaultTranslationSignal = computed(() => {
    const formTranslations = this._translationsSignal();
    const defaultMessage = formTranslations.find(
      (translation) => translation.cultureCode === this.communication?.defaultMessage?.cultureCode,
    );

    if (!defaultMessage) return undefined;

    return new CommunicationTranslation(
      defaultMessage,
      this._allLanguagesSignal().find((language) => language?.cultureCode === defaultMessage.cultureCode),
    );
  });
  public selectedTranslationForEdit?: CommunicationTranslation;

  // Signal for all translations from the form control
  private _translationsSignal = signal<CommunicationMessage[]>([]);

  // Computed signal for displayed translations based on allTranslationsFormControl
  private _displayedTranslationsSignal = computed(() => {
    const formTranslations: CommunicationMessage[] = this._translationsSignal();
    const languages = this._allLanguagesSignal();
    const defaultCultureCode = this.communication?.defaultMessage?.cultureCode;

    return formTranslations
      .filter((translation: CommunicationMessage): boolean => translation.cultureCode !== defaultCultureCode)
      .map(
        (translation: CommunicationMessage): CommunicationTranslation =>
          new CommunicationTranslation(
            translation,
            languages.find(
              (language) => language.cultureCode.toLocaleLowerCase() === translation.cultureCode?.toLocaleLowerCase(),
            ),
          ),
      );
  });

  public isInitializing = true;
  public isLoading = false;
  public disableFormControls = false;

  public allowedFileTypes: PolarisFilePickerFileExtension[] = [
    PolarisFilePickerFileExtension.DOC,
    PolarisFilePickerFileExtension.DOCX,
    PolarisFilePickerFileExtension.MP4,
    PolarisFilePickerFileExtension.PDF,
    PolarisFilePickerFileExtension.TXT,
    PolarisFilePickerFileExtension.XLS,
    PolarisFilePickerFileExtension.XLSX,
  ];

  constructor(
    private _route: ActivatedRoute,
    private _communicationsService: CommunicationsService,
    private _coreService: CoreService,
    private _fb: FormBuilder,
    private _rootFormGroup: FormGroupDirective,
    private _lookupService: LookupService,
    private _dialogService: PolarisDialogService,
    private _notificationService: PolarisNotificationService,
    private _translate: TranslateService,
    private _autoTranslateService: AutoTranslateService,
  ) {
    effect(() => {
      this._updateAttachmentFormControls(this.displayedTranslations);
    });
  }

  public ngOnInit(): void {
    this.allTranslationsFormControl = this._rootFormGroup.control.controls['translations'].get(
      'translations',
    ) as FormControl;

    this._initializeForm();
    this._getLanguageOptions();
    this._getAttachmentLinks();
  }

  /**
   * Initializes the form controls for adding/editing translations.
   */
  private _initializeForm(): void {
    // Initialize translations signal with the current value of the form control
    this._translationsSignal.set(this.allTranslationsFormControl.value ?? []);

    // Set up a subscription to update the translations signal when the form control changes
    this.allTranslationsFormControl.valueChanges.pipe(untilDestroyed(this)).subscribe((value) => {
      this._translationsSignal.set(value ?? []);
    });

    this.confirmationFormControl = new FormControl(false, Validators.requiredTrue);

    this.translationAddEditFormGroup = this._fb.group({
      language: ['', Validators.required],
      title: ['', Validators.required],
      message: ['', Validators.required],
      confirmation: this._fb.group({ acknowledge: this.confirmationFormControl }),
    });

    // Subscribe to form value changes and emit events to parent component
    this.translationAddEditFormGroup.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      if (this.translationAddEditFormGroup.dirty || this.translationAddEditFormGroup.touched) {
        this.formChange.emit(true);
      }
    });

    // Create a FormGroup where each control corresponds to a translation's attachments
    this.translationAttachmentsFormGroup = this._fb.group({});
  }

  /**
   * Fetches the available language options from the core service.
   */
  private _getLanguageOptions(): void {
    this.isInitializing = true;
    this.loadingChange.emit(this.isInitializing);
    this._coreService
      .getCoreData$({ languages: true })
      .pipe(untilDestroyed(this))
      .subscribe((coreData) => {
        this._allLanguagesSignal.set(coreData.languages);

        this.allLanguageSelectOptions = this._allLanguagesSignal().map(
          (language) =>
            new PolarisGroupOption<string>({
              value: language.cultureCode,
              label: `${language.name} (${language.cultureCode.toLocaleUpperCase()})`,
            }),
        );

        // After languages are loaded, initialize the translations signal with the form control value
        // This will trigger updates in all computed signals including _defaultTranslationSignal
        this._translationsSignal.set(this.allTranslationsFormControl.value);

        this.isInitializing = false;
        this.loadingChange.emit(this.isInitializing);

        // Check if a culture code is present in the query params and set the editing translation if it is
        const cultureCode = this._route.snapshot.queryParams['cultureCode'];
        if (cultureCode) {
          const translations = this.displayedTranslations;
          this.selectedTranslationForEdit = translations.find(
            (translation: CommunicationTranslation) =>
              translation.cultureCode.toLowerCase() === cultureCode.toLowerCase(),
          );
          if (this.selectedTranslationForEdit) {
            this._initializeFormEditMode(this.selectedTranslationForEdit);
          }
        }
      });
  }

  /**
   * Fetches the attachment links for all translations from the communication service.
   * Updates each message's attachments with the retrieved URL information.
   */
  private _getAttachmentLinks() {
    this._communicationsService
      .getAttachments$(new Communication(this.communication))
      .pipe(untilDestroyed(this))
      .subscribe((attachments) => {
        if (attachments?.messages) {
          const updatedTranslations = this.allTranslationsFormControl.value.map((message) => {
            const matchingMessage = attachments?.messages.find(
              (attachment) => attachment.messageId === message.messageId,
            );

            // Update the attachments locations of the corresponding attachments
            if (matchingMessage) {
              message.attachments = message.attachments?.map((attachment) => {
                const matchingAttachment = matchingMessage.fileAttachments?.find(
                  (item) => item.attachmentId === attachment.attachmentId,
                );

                return new CommunicationAttachment({ ...attachment, location: matchingAttachment?.url });
              });
            }

            return message;
          });

          // Use the setter method to update all translations
          this._setTranslations(updatedTranslations);
        }
      });
  }

  /**
   * Updates an existing translation in the allTranslationsFormControl.
   * Finds the translation by cultureCode and replaces it while preserving other translations.
   * @param updatedTranslation - The updated translation to replace the existing one.
   */
  private _updateTranslation(updatedTranslation: CommunicationMessage): void {
    const currentTranslations = this.allTranslationsFormControl.value ?? [];
    const updatedTranslations = currentTranslations.map((translation) =>
      translation.cultureCode === updatedTranslation.cultureCode ? updatedTranslation : translation,
    );
    this.allTranslationsFormControl.setValue(updatedTranslations);
  }

  /**
   * Updates the entire translations array in the allTranslationsFormControl.
   * Replaces all current translations with the new array.
   * @param translations - The new translations array to set.
   */
  private _setTranslations(translations: CommunicationMessage[]): void {
    this.allTranslationsFormControl.setValue(translations);
  }

  /**
   * Initializes the form in edit mode with the selected translation's data.
   * @param translationToEdit - The translation to be edited.
   */
  private _initializeFormEditMode(translationToEdit: CommunicationTranslation): void {
    this._resetForm();
    this.translationAddEditFormGroup.patchValue({
      language: translationToEdit.language,
      title: translationToEdit.title,
      message: translationToEdit.messageBody,
    });
  }

  /**
   * Sets the disabled state of the form controls.
   * @param disabled - A boolean indicating whether to disable the form controls.
   */
  private _setFormDisabled(disabled: boolean): void {
    this.disableFormControls = disabled;
    if (disabled) {
      this.translationAddEditFormGroup.disable({ emitEvent: false });
    } else {
      this.translationAddEditFormGroup.enable({ emitEvent: false });
    }
  }

  /**
   * Resets the form to its initial state.
   */
  private _resetForm(): void {
    this.translationAddEditFormGroup.markAsPristine();
    this.translationAddEditFormGroup.markAsUntouched();
    this.translationAddEditFormGroup.updateValueAndValidity();
    this.translationAddEditFormGroup.reset();
    // Emit form change event to indicate no pending changes
    this.formChange.emit(false);
  }

  /**
   * Fetches the active status ID from the lookup service if it is not already set.
   * @returns An observable that emits the active status ID.
   */
  private _getActiveStatusId$(): Observable<number | undefined> {
    return this.activeStatusId === undefined
      ? this._lookupService.getStatuses$().pipe(
          map((statuses: CommunicationStatus[]): number | undefined => {
            return statuses.find(
              (status: CommunicationStatus): boolean => status.name === CommunicationStatusType.Active,
            )?.statusId;
          }),
          tap((statusId) => {
            this.activeStatusId = statusId;
          }),
        )
      : of(this.activeStatusId);
  }

  /**
   * Updates attachment form controls based on the provided translations list.
   * Uses Set data structure for efficient O(1) lookups to add missing controls
   * and remove unused controls from the translationAttachmentsFormGroup.
   * @param translations - The list of translation objects to sync with form controls.
   */
  private _updateAttachmentFormControls(translations: CommunicationTranslation[]): void {
    const translationCultureCodes = new Set(translations.map((translation) => translation.cultureCode));

    const existingControlNames = new Set(Object.keys(this.translationAttachmentsFormGroup.controls));

    // Add missing controls
    for (const translation of translations) {
      if (!existingControlNames.has(translation.cultureCode)) {
        this.translationAttachmentsFormGroup.addControl(
          translation.cultureCode,
          new FormControl<PolarisFilePickerFile[]>([], { nonNullable: true }),
        );
      }
    }

    // Remove unused controls
    for (const controlName of existingControlNames) {
      if (!translationCultureCodes.has(controlName)) {
        this.translationAttachmentsFormGroup.removeControl(controlName);
      }
    }

    this.translationAttachmentsFormGroup.updateValueAndValidity();
  }
  /**
   * Handles the addition of a new translation.
   * Validates the form, gets the active status ID, creates a new CommunicationMessage,
   * and updates all translations with the new message added.
   * Shows success/error notifications based on the API response.
   * @returns {void}
   */
  public onAddTranslation(): void {
    if (this.translationAddEditFormGroup.valid) {
      this.isLoading = true;
      this.loadingChange.emit(this.isLoading);

      // Disable form controls while the translation is being added
      this._setFormDisabled(true);
      this._getActiveStatusId$()
        .pipe(
          // Stop the observable chain if the status is undefined and show an error message, we need a status id to create a translation record
          tap((statusId) => {
            if (statusId === undefined) {
              this._notificationService.danger(this._translate.instant('notification.translation-add.failed'));
              this._setFormDisabled(false);
              this.isLoading = false;
              this.loadingChange.emit(this.isLoading);
            }
          }),
          filter((statusId): statusId is number => statusId !== undefined),
          switchMap((statusId) => {
            const newTranslation: CommunicationMessage = new CommunicationMessage({
              cultureCode: this.translationAddEditFormGroup.get('language')?.value ?? '',
              title: this.translationAddEditFormGroup.get('title')?.value ?? '',
              messageBody: this.translationAddEditFormGroup.get('message')?.value ?? '',
              statusId,
              attachments: [], // TODO: Add attachments when implemented
            });

            const formTranslations: CommunicationMessage[] = this.allTranslationsFormControl.value ?? [];

            return this._communicationsService.updateTranslations$(
              new Communication({
                communicationGuid: this.communication?.communicationGuid,
                defaultMessage: this.communication?.defaultMessage,
                messages: [...formTranslations, newTranslation],
              }),
            );
          }),
          untilDestroyed(this),
        )
        .subscribe((updatedCommunication) => {
          this.isLoading = false;
          this.loadingChange.emit(this.isLoading);
          // Enable form controls regardless of success
          this._setFormDisabled(false);

          // An non-null communicationGuid indicates the update was successful
          if (updatedCommunication.communicationGuid) {
            // Use the setter method to update all translations
            this._setTranslations(updatedCommunication.messages ?? []);
            this._resetForm();
            this._notificationService.success(this._translate.instant('notification.translation-add.success'));
          } else {
            this._notificationService.danger(this._translate.instant('notification.translation-add.failed'));
          }
        });
    } else {
      this.translationAddEditFormGroup.markAllAsTouched();
    }
  }

  /**
   * Handles the update of an existing translation.
   * Validates the form, updates the existing translation with new title and message values,
   * and sends the updated translations to the API.
   * Shows success dialog or error notification based on the API response.
   * @returns {void}
   */
  public onUpdateTranslation(): void {
    if (this.translationAddEditFormGroup.valid && this.selectedTranslationForEdit) {
      this.isLoading = true;
      this.loadingChange.emit(this.isLoading);
      // Disable form controls while the translation is being updated
      this._setFormDisabled(true);

      const formTranslations: CommunicationMessage[] = this.allTranslationsFormControl.value ?? [];

      formTranslations.forEach((translation) => {
        if (translation.cultureCode === this.selectedTranslationForEdit?.cultureCode) {
          translation.title = this.translationAddEditFormGroup.get('title')?.value ?? '';
          translation.messageBody = this.translationAddEditFormGroup.get('message')?.value ?? '';
        }
      });

      this._communicationsService
        .updateTranslations$(
          new Communication({
            communicationGuid: this.communication?.communicationGuid,
            defaultMessage: this.communication?.defaultMessage,
            messages: [...formTranslations],
          }),
        )
        .pipe(untilDestroyed(this))
        .subscribe((updatedCommunication) => {
          this.isLoading = false;
          this.loadingChange.emit(this.isLoading);
          // Enable form controls regardless of success
          this._setFormDisabled(false);

          // An non-null communicationGuid indicates the update was successful
          if (updatedCommunication.communicationGuid) {
            this._setTranslations(updatedCommunication.messages ?? []);
            this.selectedTranslationForEdit = undefined;
            this._resetForm();

            // Notify the user that the translation was saved but updates to other translations may be needed
            this._dialogService
              .open(TranslationSavedDialogComponent, {
                minWidth: '25dvh',
                maxWidth: '50dvh',
              })
              .pipe(untilDestroyed(this))
              .subscribe();
          } else {
            this._notificationService.danger(this._translate.instant('notification.translation-edit.failed'));
          }
        });
    } else {
      this.translationAddEditFormGroup.markAllAsTouched();
    }
  }

  /**
   * Resets the add translation form to its initial state.
   * @param showRevertEditDialog - A boolean indicating whether to show the revert edit dialog.
   */
  public onReset(showRevertEditDialog: boolean = false): void {
    if (showRevertEditDialog) {
      this._dialogService
        .open(StandardDialogComponent, {
          minWidth: '25dvh',
          maxWidth: '50dvh',
          data: {
            title: 'dialog.revert-translation.title',
            message: 'dialog.revert-translation.message',
            primaryButtonLabel: 'proceed',
            secondaryButtonLabel: 'cancel',
          },
        })
        .pipe(untilDestroyed(this))
        .subscribe((confirm) => {
          if (confirm) {
            this._resetForm();
            if (this.selectedTranslationForEdit) {
              this._initializeFormEditMode(this.selectedTranslationForEdit);
            }
          }
        });
    } else {
      this._resetForm();
    }
  }

  /**
   * Handles the cancellation of editing a translation.
   * Opens a confirmation dialog to prompt the user before discarding changes.
   * If the user confirms, resets the selected translation for editing and clears the form.
   * @returns {void}
   */
  public onCancelEditTranslation(): void {
    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.discard-edit-translation.title',
          message: 'dialog.discard-edit-translation.message',
          primaryButtonLabel: 'discard',
          secondaryButtonLabel: 'keep-editing',
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe((confirm) => {
        if (confirm) {
          this.selectedTranslationForEdit = undefined;
          this._resetForm();
        }
      });
  }

  /**
   * Handles the deletion of a translation.
   * @param event - The mouse event that triggered the deletion.
   * @param deletedTranslation - The translation to be deleted.
   */
  public onDeleteTranslation(event: MouseEvent, deletedTranslation: CommunicationTranslation): void {
    event.stopPropagation();

    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.delete-translation.title',
          message: 'dialog.delete-translation.message',
          primaryButtonLabel: 'delete',
          secondaryButtonLabel: 'cancel',
          language: deletedTranslation.language,
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          this.isLoading = true;
          this.loadingChange.emit(this.isLoading);
          // Disable form controls while the translation is being deleted
          this._setFormDisabled(true);

          const formTranslations: CommunicationMessage[] = this.allTranslationsFormControl.value ?? [];

          this._communicationsService
            .updateTranslations$(
              new Communication({
                communicationGuid: this.communication?.communicationGuid,
                defaultMessage: this.communication?.defaultMessage,
                messages: formTranslations.filter(
                  (translation) => translation.cultureCode !== deletedTranslation.cultureCode,
                ),
              }),
            )
            .pipe(untilDestroyed(this))
            .subscribe((updatedCommunication) => {
              this.isLoading = false;
              this.loadingChange.emit(this.isLoading);
              // Enable form controls regardless of success
              this._setFormDisabled(false);

              // Edge case when you are deleting the translation you are currently editing
              if (this.selectedTranslationForEdit === deletedTranslation) {
                this.selectedTranslationForEdit = undefined;
                this._resetForm();
              }

              // An non-null communicationGuid indicates the update was successful
              if (updatedCommunication.communicationGuid) {
                this._setTranslations(updatedCommunication.messages ?? []);
                this._notificationService.success(this._translate.instant('notification.translation-delete.success'));
              } else {
                this._notificationService.danger(this._translate.instant('notification.translation-delete.failed'));
              }
            });
        }
      });
  }

  /**
   * Handles the upload of attachments for a specific translation.
   * Checks for duplicate files, updates UI states during upload, and updates the translation once complete.
   * @param translation - The translation to attach files to.
   * @param files - The files to upload as attachments.
   */
  public onUploadTranslationAttachments(translation: CommunicationTranslation, files: File[]): void {
    const attachmentsFormControl = this.translationAttachmentsFormGroup.get(translation.cultureCode) as FormControl<
      PolarisFilePickerFile[] | undefined
    >;

    // The list of uploads shown in the UI file picker, not the list communication attachments
    let currentFileUploads: PolarisFilePickerFile[] = attachmentsFormControl?.value ?? [];

    // Create a Set of file names that are already uploaded or are uploading in the file picker
    const unavailableFileNames = new Set([
      ...translation.attachments
        .map((attachment) => attachment.name)
        .filter((name): name is string => name !== undefined),
      ...currentFileUploads
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
    currentFileUploads = currentFileUploads.filter((upload) => !newAttachmentsNames.has(upload.name));

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
    attachmentsFormControl?.setValue([...currentFileUploads, ...newFileUploads]);

    newAttachments.forEach((attachment) => {
      this._communicationsService
        .uploadAttachment$(
          new Communication({ ...this.communication, messages: [...this.allTranslationsFormControl.value] }),
          translation.cultureCode,
          attachment,
        )
        .pipe(untilDestroyed(this))
        .subscribe((updatedMessage) => {
          let uploadStatus = PolarisFilePickerStatus.Success;
          if (updatedMessage && updatedMessage.attachments?.length) {
            // Update this specific message in the translations
            this._updateTranslation(updatedMessage);
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
          const fileUpload = attachmentsFormControl?.value?.find((upload: PolarisFilePickerFile) => {
            return upload.name === attachment.name;
          });
          if (fileUpload) {
            fileUpload.status = uploadStatus;
            fileUpload.progress = 100;
          }
        });
    });
  }

  /**
   * Handles the deletion of an attachment from a translation.
   * Updates the translation with the attachment removed upon successful deletion.
   * @param translation - The translation containing the attachment to delete.
   * @param removedAttachment - The attachment to be removed.
   */
  public onDeleteTranslationAttachment(
    translation: CommunicationTranslation,
    removedAttachment: CommunicationAttachment,
  ): void {
    this._setFormDisabled(true);

    this._communicationsService
      .deleteAttachment$(
        new Communication({ ...this.communication, messages: [...this.allTranslationsFormControl.value] }),
        translation.cultureCode,
        removedAttachment,
      )
      .pipe(untilDestroyed(this))
      .subscribe((updatedMessage) => {
        this._setFormDisabled(false);

        if (updatedMessage) {
          // Update this specific message in the translations
          this._updateTranslation(updatedMessage);
        } else {
          this._notificationService.danger(
            this._translate.instant('notification.attachment-delete.failed', {
              fileName: removedAttachment.name,
            }),
          );
        }
      });
  }

  /**
   * Handles clearing a file from the file picker UI.
   * Does not allow clearing files that are currently uploading.
   * @param translation - The translation associated with the file.
   * @param clearedFile - The file to be cleared from the file picker.
   */
  public onClearFileUpload(translation: CommunicationTranslation, clearedFile: PolarisFilePickerFile): void {
    if (clearedFile.status === PolarisFilePickerStatus.Uploading) {
      // Do not allow clearing files that are currently uploading
      return;
    }
    const translationAttachmentFormControl = this.translationAttachmentsFormGroup.get(translation.cultureCode);
    const existingUploads: PolarisFilePickerFile[] = translationAttachmentFormControl?.value ?? [];
    translationAttachmentFormControl?.setValue(
      existingUploads.filter((upload: PolarisFilePickerFile) => upload.id !== clearedFile.id),
    );
  }

  /**
   * Handles the editing of a translation.
   * @param event - The mouse event that triggered the edit.
   * @param translation - The translation to be edited.
   */
  public onSelectTranslationForEdit(event: MouseEvent, translation: CommunicationTranslation): void {
    event.stopPropagation();
    this.selectedTranslationForEdit = translation;
    this._initializeFormEditMode(translation);
    this.translationFormElement?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * Automatically translates the title and message fields of the translation form.
   * Uses the AutoTranslateService to translate from the default language to the selected target language.
   * Shows a confirmation dialog before performing translation and updates UI state during translation.
   * @returns {void}
   */
  public onAutoTranslate(): void {
    this._dialogService
      .open(StandardDialogComponent, {
        minWidth: '25dvh',
        maxWidth: '50dvh',
        data: {
          title: 'dialog.confirm-auto-translate.title',
          message: 'dialog.confirm-auto-translate.message',
          primaryButtonLabel: 'confirm',
          secondaryButtonLabel: 'cancel',
        },
      })
      .pipe(untilDestroyed(this))
      .subscribe((confirm: boolean) => {
        if (confirm) {
          this.isLoading = true;
          this.loadingChange.emit(this.isLoading);
          this._setFormDisabled(true);

          const fromCultureCode = this.communication?.defaultMessage?.cultureCode;
          const title = this.communication?.defaultMessage?.title;
          const message = this.communication?.defaultMessage?.messageBody;
          // When editing a translation, the language control is used for the target language name, not the culture code.
          let toCultureCode;
          if (this.selectedTranslationForEdit) {
            toCultureCode = this.selectedTranslationForEdit.cultureCode;
          } else {
            toCultureCode = this.translationAddEditFormGroup.get('language')?.value;
          }

          if (fromCultureCode && title && message && toCultureCode) {
            const title$ = this._autoTranslateService.getTranslation$(
              title,
              TranslationContentType.Text,
              fromCultureCode,
              toCultureCode,
            );
            const message$ = this._autoTranslateService.getTranslation$(
              message,
              TranslationContentType.HTML,
              fromCultureCode,
              toCultureCode,
            );

            forkJoin([title$, message$])
              .pipe(untilDestroyed(this))
              .subscribe({
                next: ([translatedTitle, translatedMessage]) => {
                  this.translationAddEditFormGroup.patchValue({
                    title: translatedTitle.text,
                    message: translatedMessage.text,
                  });
                },
                complete: () => {
                  this.isLoading = false;
                  this.loadingChange.emit(this.isLoading);
                  this._setFormDisabled(false);
                },
              });
          } else {
            this.isLoading = false;
            this.loadingChange.emit(this.isLoading);
            this._setFormDisabled(false);
          }
        }
      });
  }

  /**
   * Gets the displayed translations from the computed signal.
   * Returns the translations filtered to exclude the default language and mapped to CommunicationTranslation objects.
   * This is a reactive property that automatically updates when the underlying signal changes.
   * @returns {CommunicationTranslation[]} An array of communication translations filtered by the default language.
   */
  public get displayedTranslations(): CommunicationTranslation[] {
    return this._displayedTranslationsSignal();
  }

  /**
   * Gets the default translation from the computed signal.
   * Returns the default message of the communication converted to a CommunicationTranslation object.
   * This is a reactive property that automatically updates when the underlying signal changes.
   * @returns {CommunicationTranslation | undefined} The default translation or undefined if not available.
   */
  public get defaultTranslation(): CommunicationTranslation | undefined {
    return this._defaultTranslationSignal();
  }

  /**
   * Gets all available languages from the signal.
   * This is a reactive property that automatically updates when the underlying signal changes.
   * @returns {Language[]} An array of available languages.
   */
  public get allLanguages(): Language[] {
    return this._allLanguagesSignal();
  }

  /**
   * Checks if a language is selected in the add translation form.
   * Used to determine if certain UI elements should be enabled.
   * @returns A boolean indicating whether a language is selected.
   */
  public get isLanguageSelected(): boolean {
    return Boolean(this.translationAddEditFormGroup.get('language')?.value);
  }

  /**
   * Checks if the add translation button should be enabled.
   * Button is enabled when both a language is selected and the acknowledgement checkbox is checked.
   * @returns A boolean indicating whether the add translation button is enabled.
   */
  public get addTranslationEnabled(): boolean {
    return (
      this.isLanguageSelected &&
      Boolean(this.translationAddEditFormGroup.get('confirmation')?.get('acknowledge')?.value)
    );
  }

  /**
   * Gets the available languages for adding a new translation.
   * Filters out languages that are already used in existing translations or the default message.
   * This prevents creating duplicate translations for the same language.
   * @returns An array of available language options that can be used for new translations.
   */
  public get availableAddLanguages(): PolarisGroupOption<string>[] {
    const translations = this.displayedTranslations;
    const defaultCultureCode = this.defaultTranslation?.cultureCode;

    return this.allLanguageSelectOptions.filter(
      (language) =>
        language.value !== defaultCultureCode &&
        translations.every((translation: CommunicationTranslation) => translation.cultureCode !== language.value),
    );
  }
}
