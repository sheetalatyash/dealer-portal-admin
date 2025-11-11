import { OrderByExpression } from './order-by-expression.class';
import { QueryByExpression } from './query-by-expression.class';
import { QueryByFilter } from './query-by-filter.class';
import { QueryByOperator } from './query-by-operator.enum';
import { QueryContinuation } from './query-continuation.class';

/**
 * Represents the definition of a query.
 */
export class QueryDefinition {
    /**
     * The default page number.
     */
    static readonly DefaultPage: number = 1;

    /**
     * The default page size.
     */
    static readonly DefaultPageSize: number = 10;

    /**
     * Gets or sets the page number.
     */
    public pageNumber: number = QueryDefinition.DefaultPage;

    /**
     * Gets or sets the page size.
     */
    public pageSize: number = QueryDefinition.DefaultPageSize;

    /**
     * Gets or sets the query continuation token.
     */
    public queryContinuation?: QueryContinuation;

    /**
     * Gets or sets the query by operator.
     */
    public queryByOperator: QueryByOperator = QueryByOperator.And;

    /**
     * Gets or sets the list of query by filters.
     */
    public queryBy: QueryByFilter[] = [];

    /**
     * Gets or sets the list of order by expressions.
     */
    public orderBy: OrderByExpression[] = [];

    constructor(init?: Partial<QueryDefinition>) {
        Object.assign(this, init);
    }

    /**
     * Initializes a new instance of the QueryDefinition class by copying another instance.
     * @param queryDefinition The query definition to copy.
     */
    public static copy(queryDefinition: QueryDefinition): QueryDefinition {
      return new QueryDefinition({
        pageNumber: queryDefinition.pageNumber,
        pageSize: queryDefinition.pageSize,
        queryContinuation: queryDefinition.queryContinuation,
        queryByOperator: queryDefinition.queryByOperator,
        queryBy: queryDefinition.queryBy.map(filter => ({
          queryByOperator: filter.queryByOperator,
          queryByExpressions: filter.queryByExpressions.map(expression => ({
            queryByComparison: expression.queryByComparison,
            propertyName: expression.propertyName,
            propertyValue: expression.propertyValue
          }))
        })),
        orderBy: queryDefinition.orderBy.map(expression => ({
          direction: expression.direction,
          propertyName: expression.propertyName
        }))
      });
    }

    public setPageSize(pageSize: number): void {
      this.pageSize = pageSize > QueryDefinition.DefaultPageSize ? pageSize : QueryDefinition.DefaultPageSize;
    }

    /**
     * Initializes a new instance of the QueryDefinition class with a single query by expression.
     * @param queryByExpression The query by expression.
     */
    public static fromQueryByExpression(queryByExpression: QueryByExpression): QueryDefinition {
        return new QueryDefinition({
            queryBy: [{
                queryByExpressions: [queryByExpression],
                queryByOperator: QueryByOperator.And
            }]
        });
    }
}
