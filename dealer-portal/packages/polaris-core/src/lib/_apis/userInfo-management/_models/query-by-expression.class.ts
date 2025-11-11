import { QueryByComparison } from "./query-by-comparison.enum";

/**
 * Represents a query expression used to filter data based on property name, value, and comparison type.
 */
export class QueryByExpression {
    /**
     * Gets or sets the name of the property to be queried.
     */
    propertyName: string;

    /**
     * Gets or sets the value of the property to be queried.
     */
    propertyValue: string;

    /**
     * Gets or sets the comparison type to be used in the query.
     */
    queryByComparison: QueryByComparison;

    /**
     * Gets or sets the mapped property name. This property is ignored during JSON serialization.
     */
    mappedPropertyName?: string;

    /**
     * Initializes a new instance of the QueryByExpression class.
     * 
     * @param propertyName - The name of the property to be queried.
     * @param propertyValue - The value of the property to be queried.
     * @param comparison - The comparison type to be used in the query.
     * @param mappedPropertyName - The mapped property name (optional).
     */
    constructor(
        propertyName: string = '',
        propertyValue: string = '',
        queryByComparison: QueryByComparison = QueryByComparison.Contains,
        mappedPropertyName?: string
    ) {
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
        this.queryByComparison = queryByComparison;
        this.mappedPropertyName = mappedPropertyName;
    }
}