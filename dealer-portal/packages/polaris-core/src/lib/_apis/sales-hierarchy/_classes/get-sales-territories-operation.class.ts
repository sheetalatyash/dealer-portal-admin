import { GraphQLOperation } from '../../base-graphql-api-service';
import { GetSalesTerritoriesResponse } from '../_types';

export type SalesTerritoryFilterInput = {
  or?: Array<{
    territoryName?: { startsWith?: string; neq?: string };
    salesUserFirstName?: { startsWith?: string };
    salesUserLastName?: { startsWith?: string };
  }>;
  territoryName?: { in?: string[] };
};

export class GetSalesTerritoriesVariables {
  where?: SalesTerritoryFilterInput;
  first?: number;
  after?: string;
}

export class GetSalesTerritoriesOperation extends GraphQLOperation<
  GetSalesTerritoriesVariables,
  GetSalesTerritoriesResponse
> {
  query = getSalesTerritoriesQuery;

  constructor(public override variables: GetSalesTerritoriesVariables) {
    super();
  }
}

const getSalesTerritoriesQuery: string = `query GetSalesTerritories(
  $where: SalesTerritoryFilterInput = null, 
  $first: Int = 100, 
  $after: String = null
) {
  salesTerritories(
    where: $where,
    first: $first,
    after: $after,
    order: [{ territoryNumber: ASC }]
  ) {
    edges {
      node {
        salesUserFirstName
        salesUserLastName
        territoryName
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
`;
