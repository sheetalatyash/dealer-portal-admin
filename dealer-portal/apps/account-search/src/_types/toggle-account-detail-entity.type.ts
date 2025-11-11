export interface ToggleAccountDetailEntity {
  accountName: string,
  accountNumber: string,
  systemId: string,
  classCode: string,
  employeeId: string,
  partnerType: string,
  state: string,
  city: string,
  hierarchy: ToggleAccountDetailEntity[]
}
