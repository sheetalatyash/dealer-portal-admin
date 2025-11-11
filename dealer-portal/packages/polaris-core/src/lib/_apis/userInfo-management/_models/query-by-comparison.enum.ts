/**
 * Specifies the type of comparison to be used in a query.
 */
export enum QueryByComparison {
    /**
     * The query will check if the value contains the specified substring.
     */
    Contains = 0,

    /**
     * The query will check if the value starts with the specified substring.
     */
    StartsWith = 1,

    /**
     * The query will check if the value ends with the specified substring.
     */
    EndsWith = 2,

    /**
     * The query will check if the value is equal to the specified value.
     */
    Equals = 3,

    /**
     * The query will check if the value is not equal to the specified value.
     */
    NotEqual = 4,

    /**
     * The query will check if the value is less than the specified value.
     */
    LessThan = 5,

    /**
     * The query will check if the value is less than or equal to the specified value.
     */
    LessThanOrEqual = 6,

    /**
     * The query will check if the value is greater than the specified value.
     */
    GreaterThan = 7,

    /**
     * The query will check if the value is greater than or equal to the specified value.
     */
    GreaterThanOrEqual = 8
}