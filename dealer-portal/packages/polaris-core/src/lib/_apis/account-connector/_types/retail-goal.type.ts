/**
 * Represents a retail goal with product line, actual sales, and target goal.
 */
export interface RetailGoal {
  /**
   * The product line associated with the retail goal.
   */
  productLine: string;

  /**
   * The actual sales achieved for the product line.
   */
  actual: number;

  /**
   * The target sales goal for the product line.
   */
  goal: number;
}
