import { OrderByDirection } from './order-by-direction.enum';

/**
 * Represents an expression used to order query results.
 */
export class OrderByExpression {
    /**
     * Gets or sets the name of the property to order by.
     */
    propertyName: string;

    /**
     * Gets or sets the mapped property name, if any.
     */
    mappedPropertyName?: string;

    /**
     * Gets or sets the direction of the order (ascending or descending).
     */
    direction: OrderByDirection;

    /**
     * Initializes a new instance of the OrderByExpression class.
     * 
     * @param propertyName - The name of the property to order by.
     * @param direction - The direction of the order (ascending or descending).
     * @param mappedPropertyName - The mapped property name, if any.
     */
    constructor(
        propertyName: string = '',
        direction: OrderByDirection = OrderByDirection.Ascending,
        mappedPropertyName?: string
    ) {
        this.propertyName = propertyName;
        this.direction = direction;
        this.mappedPropertyName = mappedPropertyName;
    }
}