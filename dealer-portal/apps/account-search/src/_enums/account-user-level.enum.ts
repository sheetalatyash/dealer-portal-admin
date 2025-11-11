export enum AccountUserLevel {
  SalesManager = 'Level1',
  RegionalManager = 'Level2',
  DirectorOfSales = 'Level3',
  Unknown = 'Unknown'
}

export function isAccountUserLevel(value?: string): AccountUserLevel {

  switch (value?.toLowerCase()) {
    case 'level1':
      return AccountUserLevel.SalesManager;
    case 'level2':
      return AccountUserLevel.RegionalManager;
    case 'level3':
      return AccountUserLevel.DirectorOfSales;
    default:
      return AccountUserLevel.Unknown;
  }
}
