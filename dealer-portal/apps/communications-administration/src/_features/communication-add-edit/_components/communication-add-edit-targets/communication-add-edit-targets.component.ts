import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourceService } from '@dealer-portal/polaris-core';
import { SelectDeleteTableBaseEntity } from '../../../../_view_models/select-delete-table-base-entity';
import {
  PolarisButton,
  PolarisCheckboxGroup,
  PolarisFilePicker,
  PolarisFilePickerFile,
  PolarisFilePickerFileExtension,
  PolarisFilePickerStatus,
  PolarisGroupOption,
  PolarisIcon,
  PolarisLoader,
  PolarisTableColumnConfig,
} from '@dealer-portal/polaris-ui';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { AccountStatusFilter } from '@enums/account-status-filter.enum';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SelectDeleteTableComponent } from '../select-delete-table/select-delete-table.component';
import { CommonModule } from '@angular/common';
import { TooltipService } from '../../services/tooltip/tooltip.service';

/**
 * Wrapper component for managing targets and shared functionality to upload specific communication targets in the add/edit communication workflow.
 */
@Component({
  imports: [
    CommonModule,
    PolarisLoader,
    SelectDeleteTableComponent,
    TranslatePipe,
    PolarisCheckboxGroup,
    PolarisIcon,
    PolarisButton,
    PolarisLoader,
    PolarisFilePicker,
  ],
  selector: 'ca-communication-add-edit-targets',
  templateUrl: './communication-add-edit-targets.component.html',
  styleUrls: ['./communication-add-edit-targets.component.scss'],
})
export class CommunicationAddEditTargetsComponent<T extends SelectDeleteTableBaseEntity> implements OnInit {
  // Target Step Details Inputs
  @Input() stepTitle!: string;
  @Input() stepDescription!: string;
  @Input() isLoading!: boolean;

  // Target Form Inputs
  @Input() specificTargetsFormGroup!: FormGroup;
  @Input() specificTargetsLabel!: string;
  @Input() isSpecificTargetsOptional: boolean = false;
  @Input() isSpecificTargetsSelected!: boolean;
  @Input() isAnyOptionalGeneralTargetSelected!: boolean;

  // Target File Upload Inputs
  @Input() templateFileName!: string;
  @Input() uploadFiles?: PolarisFilePickerFile[];
  @Input() filePickerFormControl!: FormControl;
  @Input() maximumFileSize: number = 5 * 1024 * 1024;

  // Target Table Inputs
  @Input() tableData$!: Observable<T[]>;
  @Input() tableColumns!: PolarisTableColumnConfig<T>[];

  @Output() fileSelected = new EventEmitter<File[]>();
  @Output() fileCanceled = new EventEmitter<PolarisFilePickerFile>();
  @Output() rowsDeleted = new EventEmitter<T[]>();

  public PolarisFilePickerStatus = PolarisFilePickerStatus;

  public AccountStatusFilters = Object.keys(AccountStatusFilter) as AccountStatusFilter[];

  public allowedFileTypes = [PolarisFilePickerFileExtension.CSV, PolarisFilePickerFileExtension.TXT];

  // The checkbox group for specific accounts selection
  public specificAccountsSelection: PolarisGroupOption<string>[] = [];

  constructor(
    private _resourceService: ResourceService,
    private _translate: TranslateService,
    public toolTipService: TooltipService,
  ) {}

  public ngOnInit(): void {
    this.specificAccountsSelection = [
      new PolarisGroupOption<string>({
        label: this._translate.instant(this.specificTargetsLabel),
        formControlName: 'specificAccountSelected',
        labelClass: 'fw-semibold font-size-sm',
        optional: this.isSpecificTargetsOptional,
      }),
    ];
  }

  /**
   * Emits the selected files via the `fileSelected` output event.
   * @param files - Array of selected File objects.
   */
  public onFileSelected(files: File[]): void {
    this.fileSelected.emit(files);
  }

  /**
   * Emits the canceled file via the `fileCanceled` output event.
   * @param file - The PolarisFilePickerFile that was canceled.
   */
  public onCancelFile(file: PolarisFilePickerFile): void {
    this.fileCanceled.emit(file);
  }

  /**
   * Emits the deleted row data via the `rowsDeleted` output event.
   * @param deletedRowData - Array of deleted table row entities.
   */
  public onRowsDeleted(deletedRowData: T[]): void {
    this.rowsDeleted.emit(deletedRowData);
  }

  /**
   * Initiates the download of a template file from the CDN.
   */
  public onDownloadTemplate(): void {
    let cdnPath = this._resourceService.getCDNPath();
    // Append a trailing slash to the CDN path if it's not empty
    if (cdnPath) {
      cdnPath += '/';
    }

    const filePath = cdnPath + this.templateFileName;
    const link = document.createElement('a');
    link.href = filePath;
    link.download = this.templateFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
