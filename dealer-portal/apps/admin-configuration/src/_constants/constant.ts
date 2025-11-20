export const rawAuctionRules = [
  { value: 'standard', label: 'Standard Auction (DC/PL/US)' },
  { value: 'openPL', label: 'Open Auction with PL (PL/US)' },
  { value: 'openFull', label: 'Open Auction Full (US)' },
  { value: 'custom', label: 'Custom' },
];

export const periodRawOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];
export const laneRawOptions = Array.from({ length: 50 }, (_, i) => i + 1);
export const timezoneRawOptions = [
  { offset: 480, label: 'Alaska Time' },
  { offset: 420, label: 'Pacific Time' },
  { offset: 360, label: 'Mountain Time' },
  { offset: 300, label: 'Central Standard Time' },
  { offset: 240, label: 'Eastern Time' },
  { offset: 180, label: 'Atlantic Time' },
  { offset: 150, label: 'Newfoundland Time' },
];
