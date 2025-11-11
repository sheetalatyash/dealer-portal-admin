import { QueryByOperator } from './query-by-operator.enum';
import { QueryByExpression } from './query-by-expression.class';

/**
 * Represents a filter query with a specified operator and a list of expressions.
 */
export class QueryByFilter {
    /**
     * Gets or sets the operator used to combine the query expressions.
     */
    queryByOperator: QueryByOperator = QueryByOperator.And;

    /**
     * Gets or sets the list of query expressions.
     */
    queryByExpressions: QueryByExpression[] = [];

    /**
     * Initializes a new instance of the QueryByFilter class.
     * @param queryByOperator The operator used to combine the query expressions.
     * @param queryByExpressions The list of query expressions
     */
    constructor(  
        queryByOperator: QueryByOperator = QueryByOperator.And,
        queryByExpressions: QueryByExpression[] = []   
    ) {
        this.queryByOperator = queryByOperator;
        this.queryByExpressions = queryByExpressions;
    }
}