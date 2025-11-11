
import { AccountAddress, AccountProduct, AccountServiceIdentifier, AccountTerritory, ProductLinesBySalesBusinessUnit } from "@classes";
import { AccountEntity } from '@dealer-portal/polaris-core';
import { ServiceIdentifierTypes } from "@enums/index";

export class Account {

  public accountId?: string = '';
  public accountName?: string = '';
  public emailAddress?: string = '';
  public accountStatus?: string = '';
  public classCode?: string = '';
  public classDescription?: string = '';
  public parentBusinessUnit?: string = '';
  public partnerType?: string = '';
  public phoneNumber: number = 0;
  public owningBusinessUnit?: string = '';
  public accountNumber?: string = '';
  public orvMarketingRegion?: string = '';
  public addresses: AccountAddress[] = [];
  public primaryAddress?: AccountAddress;
  public products: AccountProduct[] = [];
  public productLinesBySalesBusinessUnit: ProductLinesBySalesBusinessUnit[] = [];
  public territories: AccountTerritory[] = [];
  public serviceIdentifiers?: AccountServiceIdentifier[] = [];
  public website?: string = '';
  public title?: string = ''; // Convenience property for display purposes only

  private readonly _indexNotFound: number = -1;

  constructor(private _entity: Partial<AccountEntity> = {}) {
    this.accountId = _entity?.accountId;
    this.accountName = _entity?.name;
    this.emailAddress = _entity?.emailAddress;
    this.accountStatus = _entity?.dealerStatus;
    this.classCode = _entity?.classCode;
    this.classDescription = _entity?.classCodeDescription;
    this.parentBusinessUnit = _entity?.parentBusinessUnit;
    this.partnerType = _entity?.partnerType;
    this.phoneNumber = !_entity.phoneNumber ? 0 : +_entity.phoneNumber;
    this.owningBusinessUnit = _entity?.owningBusinessUnit;
    this.accountNumber = _entity?.dealerNumber;
    this.orvMarketingRegion = _entity?.orvMarketingRegion;
    this.addresses = _entity?.addresses ? _entity.addresses.map(entity => new AccountAddress(entity)) : [];
    this.territories = _entity?.territories ? _entity.territories.map(entity => new AccountTerritory(entity)) : [];
    this.serviceIdentifiers = _entity?.serviceIdentifiers ?
      _entity.serviceIdentifiers
        .filter(entity => entity.id && entity.type)
        .map(entity => new AccountServiceIdentifier(entity))
      : [];
    this.website = _entity?.website;

    // account title should be account number - account name, except when an international system id is present
    const internationalSystemId = this.systemId;
    this.title = [(internationalSystemId ? internationalSystemId : this.accountNumber), this.accountName].filter(s => s != null && s.trim() !== "").join(" - ");

    //TODO: work in progress; un-flatten product lines
    _entity.productLines?.forEach(product => {
      const pfIndex = this.products?.findIndex(p => p.productFamilyName === product.productLineCode);
      if (pfIndex === this._indexNotFound) {
        this.products.push(new AccountProduct(product));
      } else {
        if (product.productLineCode) {
          const foundProduct = this.products[pfIndex];
          const plIndex = foundProduct.productLines.findIndex(pl => pl === product.productLineCode);
          if (plIndex === this._indexNotFound) {
            if (product.description) {
              foundProduct.productLines.push(product.description);
            }
          }
        }
      }
    });

  }

  public get systemId(): string | undefined {
    const allowedTypes = [ServiceIdentifierTypes.AX.toString(), ServiceIdentifierTypes.IBMi.toString(), ServiceIdentifierTypes.iDEX.toString()];
    const firstMatch = this.serviceIdentifiers?.find(item => allowedTypes.includes(item.type ?? ''));
    const systemId = firstMatch?.id;

    return systemId;
  }
}
