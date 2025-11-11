import { ToggleAccountDetailEntity } from './toggle-account-detail-entity.type';

export interface ToggleAccountEntity {
  accountNumber?: string,
  accountName?: string,
  systemId?: string,
  userName?: string,
  countryCode?: string,
  stateOrProvince?: string,
  portalAuthenticationId?: string,
  shareToWebInfinity?: string,
  cultureCode?: string,
  isDealerAdmin?: string,
  isDealerGroupImpersonation?: string,
  isDealerPortal?: string,
  accounts: ToggleAccountDetailEntity[]
}
