import { CustomerClass } from '@dealer-portal/polaris-core';
import { ClassCodeType } from '@enums';
import { ToggleAccountDetailEntity } from '@types';

export class ToggleAccount {

  public accountName?: string = '';
  public accountNumber?: string = '';
  public accountType?: string = '';
  public backgroundColor?: string = ''
  public city?: string = '';
  public classCode?: string = '';
  public dealerNumber?: string = '';
  public details: ToggleAccount[] = [];
  public state?: string = '';
  public systemId?: string = '';
  public isOwner: boolean = false;
  public isOperator: boolean = false;
  public isDealer: boolean = false;

  constructor(entity: Partial<ToggleAccountDetailEntity> = {}, classes: CustomerClass[] = []) {
    Object.assign(this, entity);

    const classFound = classes.find((customerClass:CustomerClass) => customerClass.id.toLowerCase() === entity.classCode?.toLowerCase());
    this.accountType = classFound ? classFound.name : "";

    // NG template formatting and translation
    this.isOwner = this.classCode === ClassCodeType.Owner;
    this.isOperator = this.classCode === ClassCodeType.Operator;
    this.isDealer = this.classCode === ClassCodeType.Dealer;
  }
}
