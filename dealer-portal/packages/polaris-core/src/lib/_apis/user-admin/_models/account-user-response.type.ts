import { DealerEntity } from "./dealer-entity.type";

/**
 * Represents the response for an account user.
 */
export interface AccountUserResponse {
  /**
   * Indicates if the user is active.
   */
  active: boolean;

  /**
   * Indicates if the user is an admin.
   */
  admin: boolean;

  /**
   * A list of the user's associated dealers.
   */
  dealers: DealerEntity[];

  /**
   * The department of the user as a string.
   */
  departmentString: string;

  /**
   * The email address of the user.
   */
  emailAddress: string;

  /**
   * The status code of the employee.
   */
  employeeStatusCode: number;

  /**
   * The type of employment as a string.
   */
  employmentTypeString: string;

  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * Indicates if the user is the primary communication contact.
   */
  isPrimaryCommunicationContact: boolean;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * Indicates if the user is eligible for points.
   */
  pointsEligible: boolean;

  /**
   * The portal authentication ID of the user.
   */
  portalAuthenticationId: string;

  /**
   * The role of the user as a string.
   */
  roleString: string;

  /**
   * Indicates if the user is eligible for SPIFF (Sales Performance Incentive Fund).
   */
  spiffEligible: boolean;
}
