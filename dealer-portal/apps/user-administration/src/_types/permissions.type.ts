import { FormControl, FormGroup } from '@angular/forms';
import { AccessControlLevel, AdditionalClaim, PageAccessoryCategory } from '@dealer-portal/polaris-core';
import { PolarisGroupOption } from '@dealer-portal/polaris-ui';

export interface ClaimsFormGroup {
  [claimName: string]: FormControl<boolean>;
}

export interface PermissionNodeView {
  contentId: number;
  menuName: string;
  accessFormControl: FormControl<AccessControlLevel | null>;
  claimsFormGroup?: FormGroup<ClaimsFormGroup>;
  accessOptions: PolarisGroupOption<AccessControlLevel>[];
  claimOptions?: PolarisGroupOption<AdditionalClaim>[];
  children?: PermissionNodeView[];
}

export interface PermissionsViewModel {
  pages: PermissionNodeView[];
  pageAccessoryCategories: PageAccessoryCategory[];
}

export interface PermissionPayload {
  accountNumber: string;
  email: string;
  pageId: number;
  access: AccessControlLevel;
}
