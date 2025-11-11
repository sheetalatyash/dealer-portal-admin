import { GraphQLFileOperation } from '../../base-graphql-api-service/base-graphql-api.service.types';

export interface GetAccountsByFileVariables {
  file: File;
}

export class GetAccountsByFileOperation extends GraphQLFileOperation<GetAccountsByFileVariables> {
  query = getAccountsByFileMutation;
  constructor(public override variables: GetAccountsByFileVariables) {
    super();
  }
}

const getAccountsByFileMutation = `mutation GetAccountsByFile(
  $file: Upload!
) {
  uploadAccountFile(file: $file) {
    dealerNumber
    name
    addresses {
      city
      stateOrProvince
    }
    dealerStatus
  }
}`;
