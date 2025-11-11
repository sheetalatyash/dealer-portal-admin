import { AccountStatusFilter } from '@enums/account-status-filter.enum';

export class SelectDeleteTableBaseEntity {
  public id!: string;
  public status!: AccountStatusFilter;
}
