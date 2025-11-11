import { GraphQLOperation } from '../../base-graphql-api-service/base-graphql-api.service.types';

export interface GetAccountsVariables {
  searchTerm?: string;
  accountNumber?: string;
  countryCodes?: string[];
  customerClasses?: string[];
  partnerTypes?: string[];
  productLines?: string[];
  stateProvinceCodes?: string[];
  dealerNumbers?: string[];
  includeInactive?: boolean;
  includeNotFound?: boolean;
  first?: number;
  after?: string;
}

export class GetAccountsOperation extends GraphQLOperation<GetAccountsVariables> {
  query = getAccountsQuery;
  constructor(public override variables: GetAccountsVariables) {
    super();
  }
}

const getAccountsQuery = `query GetAccounts(
  $searchTerm: String
  $accountNumber: String
  $dealerNumbers: [String!]
  $countryCodes: [String!]
  $customerClasses: [String!]
  $partnerTypes: [String!]
  $productLines: [String!]
  $stateProvinceCodes: [String!]
  $includeNotFound: Boolean
  $includeInactive: Boolean
  $first: Int = 100
  $after: String
) {
  accounts(
    searchTerm: $searchTerm
    accountNumber: $accountNumber
    dealerNumbers: $dealerNumbers
    countryCodes: $countryCodes
    customerClasses: $customerClasses
    partnerTypes: $partnerTypes
    productLines: $productLines
    stateProvinceCodes: $stateProvinceCodes
    first: $first
    after: $after
    includeNotFound: $includeNotFound
    includeInactive: $includeInactive
  ) {
    totalCount
    nodes {
      accountId
      name
      emailAddress
      addresses {
        postalCode
        stateOrProvince
        countryCode
        coordinates {
          latitude
          longitude
        }
        city
        addressLine1
        addressType
      }
      productLines {
        description
        productLineName
        productLineCode
        salesManager
      }
      territories {
        polarisManager
        salesBusinessUnit
        salesforceRole
      }
      serviceIdentifiers {
        id
        type
      }
      classCode
      classCodeDescription
      dealerStatus
      parentBusinessUnit
      partnerType
      phoneNumber
      owningBusinessUnit
      dealerNumber
      orvMarketingRegion
      website
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;
