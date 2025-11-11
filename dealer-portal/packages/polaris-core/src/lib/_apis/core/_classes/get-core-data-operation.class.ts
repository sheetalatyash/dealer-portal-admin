import { GraphQLOperation } from '../../base-graphql-api-service';
import { CoreDataEntity } from '../core.service.api.types';

export class GetCoreDataVariables {
  countries?: boolean;
  customerClasses?: boolean;
  languages?: boolean;
  partnerTypes?: boolean;
  productLineByFamily?: boolean;
  productLineByBusinessUnit?: boolean;
  stateAndProvinces?: boolean;
  departments?: boolean;
  staffRoles?: boolean;
  serviceStaffRoles?: boolean;
}

export class GetCoreDataOperation extends GraphQLOperation<GetCoreDataVariables, CoreDataEntity> {
  query = coreDataQuery;
  constructor(public override variables: GetCoreDataVariables) {
    super();
  }
}

const coreDataQuery = `query CoreData(
  $countries: Boolean = false
  $customerClasses: Boolean = false
  $languages: Boolean = false
  $partnerTypes: Boolean = false
  $productLineByFamily: Boolean = false
  $productLineByBusinessUnit: Boolean = false
  $stateAndProvinces: Boolean = false
  $departments: Boolean = false
  $staffRoles: Boolean = false
  $serviceStaffRoles: Boolean = false
) {
  countries @include(if: $countries) {
    code
    name
  }
  customerClasses @include(if: $customerClasses) {
    id
    name
  }
  languages @include(if: $languages) {
    cultureCode
    name
  }
  partnerTypes @include(if: $partnerTypes) {
    id
    name
  }
  productLinesByProductFamily @include(if: $productLineByFamily) {
    productFamily
    productLines {
      description
      id
      name
      productFamily
      productGUID
      status
      salesBusinessUnit
      defaultSortOrder
    }
  }
  productLinesByBusinessUnit @include(if: $productLineByBusinessUnit) {
    salesBusinessUnit
    salesBusinessSort
    productLines {
      description
      id
      name
      productFamily
      productGUID
      status
      salesBusinessUnit
      defaultSortOrder
    }
  }
  stateProvinces @include(if: $stateAndProvinces) {
    code
    countryCode
    name
  }
  departments @include(if: $departments) {
    id
    name
  }
  staffRoles @include(if: $staffRoles) {
    id
    name
  }
  serviceStaffRoles @include(if: $serviceStaffRoles) {
    id
    name
  }
}`;
