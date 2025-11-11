export class CommunicationListingOptions {
  public searchString?: string;
  public statusId?: number;
  public groupIds: number[] = [];
  public myCommunication?: boolean;
  public productLineCodes: string[] = [];
  public sortBy?: string;
  public sortDirection?: string;
  public cultureCode?: string;
  public isFavorite?: boolean;
  public isArchive?: boolean;
  public sortByStartDateDescending: boolean = true;

  // Options is not private so it doesn't get assigned as a class variable when this is transformed into query parameters
  constructor(options: Partial<CommunicationListingOptions> = {}) {
    Object.assign(this, options);
  }
}
