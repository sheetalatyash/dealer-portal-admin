import { AccountAddressEntity, AccountProductEntity, AccountServiceIdentifierEntity, AccountTerritoryEntity } from ".";

export interface AccountEntity {
  accountId?: string,
  name?: string,
  emailAddress?: string;
  classCode?: string;
  classCodeDescription?: string;
  dealerStatus?: string,
  parentBusinessUnit?: string
  partnerType?: string
  phoneNumber?: string
  owningBusinessUnit?: string
  dealerNumber?: string
  orvMarketingRegion?: string
  addresses?: AccountAddressEntity[];
  productLines?: AccountProductEntity[];
  serviceIdentifiers?: AccountServiceIdentifierEntity[];
  territories?: AccountTerritoryEntity[];
  website?: string;
}
