import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolarisDivider, PolarisError } from '@dealer-portal/polaris-ui';
import { ErrorPayload, UserAdministrationService } from '@services';

// ---- Strongly typed hierarchy configs ----
export interface ControlOrder {
  [controlName: string]: number;
}

export interface CategoryOrder {
  sortOrder: number;
  fieldSortOrder?: ControlOrder;
}

export interface PageOrder {
  sortOrder: number;
  fieldSortOrder?: Record<string, CategoryOrder>;
}

export interface ErrorListOrder {
  [page: string]: PageOrder;
}

// ---- What the component actually renders ----
export interface ErrorListItem {
  page: string;
  category?: string;
  control?: string;
  errorMessage: string;
  sortOrder: number;
}

@Component({
  selector: 'ua-error-list',
  imports: [CommonModule, PolarisDivider, PolarisError],
  templateUrl: './error-list.component.html',
  styleUrl: './error-list.component.scss',
})
export class ErrorListComponent {
  private readonly _errorListOrder: ErrorListOrder = {
    profile: {
      sortOrder: 0,
      fieldSortOrder: {
        contactInfo: {
          sortOrder: 0,
          fieldSortOrder: {
            firstName: 0,
            lastName: 1,
            userName: 2,
            confirmUserName: 3,
            jobTitle: 4,
            phone: 5,
          },
        },
        employmentType: { sortOrder: 1 },
        departments: { sortOrder: 2 },
        role: { sortOrder: 3 },
        serviceStaffRoles: { sortOrder: 4 },
      },
    },
    permissions: {
      sortOrder: 1,
      fieldSortOrder: {},
    },
    communications: {
      sortOrder: 2,
      fieldSortOrder: {},
    },
  } satisfies ErrorListOrder;

  public readonly errorListItems: Signal<ErrorListItem[]> = computed<ErrorListItem[]>((): ErrorListItem[] => {
    const errorPayloads: ErrorPayload[] = this.userAdministrationService.errorPayloads();

    const flattenedErrorList: ErrorListItem[] = errorPayloads.flatMap((errorPayload: ErrorPayload): ErrorListItem[] =>
      (errorPayload.messages ?? []).map((message: string): ErrorListItem => ({
        page: errorPayload.page,
        category: errorPayload.category,
        control: errorPayload.control,
        errorMessage: message,
        sortOrder: this._getSortOrder(errorPayload),
      })),
    );

    return flattenedErrorList.sort(
      (first: ErrorListItem, second: ErrorListItem): number => first.sortOrder - second.sortOrder,
    );
  });

  constructor(
    public readonly userAdministrationService: UserAdministrationService,
  ) {}

  private _getSortOrder(errorPayload: ErrorPayload): number {
    const { page, category, control, customSortOrder } = errorPayload;

    // 1. customSortOrder wins
    if (typeof customSortOrder === 'number') {
      return customSortOrder;
    }

    // 2. hierarchy
    const pageOrder: number = this._errorListOrder[page]?.sortOrder ?? 9999;
    const categoryOrder: number = category
      ? this._errorListOrder[page]?.fieldSortOrder?.[category]?.sortOrder ?? 9999
      : 9999;
    const controlOrder: number = control
      ? this._errorListOrder[page]?.fieldSortOrder?.[category ?? '']?.fieldSortOrder?.[control] ?? 9999
      : 9999;

    // 3. flatten to single number
    return pageOrder * 10000 + categoryOrder * 100 + controlOrder;
  }

  public trackByError(index: number, errorListItem: ErrorListItem): string {
    return `${errorListItem.page}|${errorListItem.category ?? ''}|${errorListItem.control ?? ''}|${errorListItem.errorMessage}`;
  }

  public scrollToControl(errorListItem: ErrorListItem): void {
    const targetId: string | undefined =
      errorListItem.control ?? errorListItem.category;

    if (!targetId) {
      return;
    }

    const element: HTMLElement | null = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
