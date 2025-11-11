import { GetAccountsVariables } from './get-accounts-operation.class';

export class AccountFilterArguments {
  public accountNameOrNumber: string;
  public countryCodes: string[];
  public customerClasses: string[];
  public partnerTypes: string[];
  public productLines: string[];
  public stateProvinceCodes: string[];
  public statuses: string[];
  public dealerNumbers: string[];
  public continuationToken: string;

  constructor(
    options: {
      accountNameOrNumber?: string;
      countryCodes?: string[];
      customerClasses?: string[];
      partnerTypes?: string[];
      productLines?: string[];
      stateProvinceCodes?: string[];
      statuses?: string[];
      dealerNumbers?: string[];
      continuationToken?: string;
    } = {},
  ) {
    this.accountNameOrNumber = options.accountNameOrNumber || '';
    this.countryCodes = options.countryCodes || [];
    this.customerClasses = options.customerClasses || [];
    this.partnerTypes = options.partnerTypes || [];
    this.productLines = options.productLines || [];
    this.stateProvinceCodes = options.stateProvinceCodes || [];
    this.statuses = options.statuses || [];
    this.dealerNumbers = options.dealerNumbers || [];
    this.continuationToken = options.continuationToken || '';
  }

  public get isEmpty(): boolean {
    return (
      !this.accountNameOrNumber &&
      (!this.countryCodes || this.countryCodes.length === 0) &&
      (!this.customerClasses || this.customerClasses.length === 0) &&
      (!this.partnerTypes || this.partnerTypes.length === 0) &&
      (!this.productLines || this.productLines.length === 0) &&
      (!this.stateProvinceCodes || this.stateProvinceCodes.length === 0) &&
      (!this.statuses || this.statuses.length === 0) &&
      (!this.dealerNumbers || this.dealerNumbers.length === 0)
    );
  }

  public toGetAccountsVariables(first: number = 100): GetAccountsVariables {
    const defined = <T>(value: T[] | string): T[] | string | undefined =>
      value && value.length > 0 ? value : undefined;

    return {
      first,
      searchTerm: defined(this.accountNameOrNumber) as string | undefined,
      countryCodes: defined(this.countryCodes) as string[] | undefined,
      customerClasses: defined(this.customerClasses) as string[] | undefined,
      partnerTypes: defined(this.partnerTypes) as string[] | undefined,
      productLines: defined(this.productLines) as string[] | undefined,
      stateProvinceCodes: defined(this.stateProvinceCodes) as string[] | undefined,
      dealerNumbers: defined(this.dealerNumbers) as string[] | undefined,
      after: defined(this.continuationToken) as string | undefined,
      includeInactive: this.statuses.includes('includeInactive') || undefined,
      includeNotFound: this.statuses.includes('includeNotFound') || undefined,
    };
  }

  public toString(): string {
    const filterArguments: string[] = ['first: 100'];

    if (this.accountNameOrNumber) filterArguments.push(`searchTerm:"${this.accountNameOrNumber}"`);
    if (this.countryCodes.length > 0) filterArguments.push(`countryCodes:${JSON.stringify(this.countryCodes)}`);
    if (this.customerClasses.length > 0)
      filterArguments.push(`customerClasses:${JSON.stringify(this.customerClasses)}`);
    if (this.partnerTypes.length > 0) filterArguments.push(`partnerTypes:${JSON.stringify(this.partnerTypes)}`);
    if (this.productLines.length > 0) filterArguments.push(`productLines:${JSON.stringify(this.productLines)}`);
    if (this.stateProvinceCodes.length > 0)
      filterArguments.push(`stateProvinceCodes:${JSON.stringify(this.stateProvinceCodes)}`);
    if (this.statuses.length > 0) {
      filterArguments.push(`includeInactive:${this.statuses.includes('includeInactive')}`);
      filterArguments.push(`includeNotFound:${this.statuses.includes('includeNotFound')}`);
    }
    if (this.dealerNumbers.length > 0) filterArguments.push(`dealerNumbers:${JSON.stringify(this.dealerNumbers)}`);
    if (this.continuationToken) filterArguments.push(`after:"${this.continuationToken}"`);

    return filterArguments.join(',');
  }
}
