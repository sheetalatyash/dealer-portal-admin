import { AccessControlLevel } from '../_enums';

export interface AccessControlConfig {
  level: AccessControlLevel;
  exactMatch?: boolean; // Optional, defaults to false
}
