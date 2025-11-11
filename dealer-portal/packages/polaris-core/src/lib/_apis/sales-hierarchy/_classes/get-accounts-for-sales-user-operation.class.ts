import { GraphQLOperation } from '../../base-graphql-api-service';
import { GetAccountsForSalesUserResponse } from '../_types';

export class GetAccountsForSalesUserVariables {
  salesUserEmailAddress?: string;
  salesUserUsername?: string;
  salesUserPortalId?: string;
  territoryNumber?: number;
}

export class GetAccountsForSalesUserOperation extends GraphQLOperation<
  GetAccountsForSalesUserVariables,
  GetAccountsForSalesUserResponse
> {
  query = getAccountsForSalesUserQuery;
  constructor(public override variables: GetAccountsForSalesUserVariables) {
    super();
  }
}

const getAccountsForSalesUserQuery = `query GetAccountsForSalesUser(
  $salesUserEmailAddress: String = null
  $salesUserUsername: String = null
  $salesUserPortalId: String = null
  $territoryNumber: Int = null
) {
  accountsForSalesUser(
    salesUserEmailAddress: $salesUserEmailAddress
    salesUserUsername: $salesUserUsername
    salesUserPortalId: $salesUserPortalId
    territoryNumber: $territoryNumber
  ) {
    accountCity
    accountName
    accountNumber
    accountStateOrProvince
    level1SalesUserDomainUsername
    level1SalesUserFirstName
    level1SalesUserLastName
    level1SalesUserPortalId
    level1SalesUserRoleName
    level1Territory
    level2SalesUserDomainUsername
    level2SalesUserFirstName
    level2SalesUserLastName
    level2SalesUserPortalId
    level2SalesUserRoleName
    level2Territory
    level3SalesUserDomainUsername
    level3SalesUserFirstName
    level3SalesUserLastName
    level3SalesUserPortalId
    level3SalesUserRoleName
    level3Territory
    productLineCode
    primaryTerritory
    territoryName
    territoryTypeName
  }
}`;
