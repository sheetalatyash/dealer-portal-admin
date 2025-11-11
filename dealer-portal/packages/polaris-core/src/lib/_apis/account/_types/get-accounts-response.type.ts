import { GraphQLConnection } from '../../base-graphql-api-service';
import { AccountEntity } from './account-entity.type';

export interface GetAccountsResponse {
  accounts?: GraphQLConnection<AccountEntity>;
}
