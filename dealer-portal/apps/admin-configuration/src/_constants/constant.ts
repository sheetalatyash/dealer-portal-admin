export const rawAuctionRules = [
  { value: 1, label: 'Standard Auction (DC/PL/US)' },
  { value: 2, label: 'Open Auction with PL (PL/US)' },
  { value: 3, label: 'Open Auction Full (US)' },
  { value: 4, label: 'Custom' },
];

export const periodRawOptions = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];
export const laneRawOptions = Array.from({ length: 50 }, (_, i) => i + 1);
export const statusRawOptions = [
  { value: 'change', label: 'Change' },
  // { value: 'PM', label: 'PM' },
];
