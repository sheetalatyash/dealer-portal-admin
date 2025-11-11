import { GraphQLConnection } from '../../base-graphql-api-service/base-graphql-api.service.types';
import { SalesTerritory } from './sales-territory.type';

export interface GetSalesTerritoriesResponse {
  salesTerritories: GraphQLConnection<SalesTerritory>;
}
