export interface CoreDataOptions {
  countries?: boolean;
  customerClasses?: boolean;
  departments?: boolean;
  languages?: boolean;
  partnerTypes?: boolean;
  productLineByFamily?: boolean;
  productLineByBusinessUnit?: boolean
  serviceStaffRoles?: boolean;
  staffRoles?: boolean;
  stateAndProvinces?: boolean;
}

export interface CoreDataEntity {
  countries?: CountryEntity[];
  customerClasses?: CustomerClassEntity[];
  departments?: DepartmentEntity[];
  languages?: LanguageEntity[];
  partnerTypes?: PartnerTypeEntity[];
  productLinesByProductFamily?: ProductLineByFamilyEntity[];
  productLinesByBusinessUnit?: ProductLineByBusinessUnitEntity[];
  serviceStaffRoles?: ServiceStaffRoleEntity[];
  staffRoles?: StaffRoleEntity[];
  stateProvinces?: StateProvinceEntity[];
}

export interface CountryEntity {
  code: string;
  name: string;
}

export interface CustomerClassEntity {
  id: string;
  name: string;
}

export interface LanguageEntity {
  cultureCode: string;
  name: string;
}

export interface PartnerTypeEntity {
  id: string;
  name: string;
}

export interface ProductLineEntity {
  productGUID: string;
  id: string;
  name: string;
  description: string;
  productFamily: string;
  status: string;
}

export interface ProductLineByFamilyEntity {
  productFamily: string;
  productLines: ProductLineEntity[];
}

export interface ProductLineByBusinessUnitEntity {
  salesBusinessUnit: string;
  salesBusinessSort: number;
  productLines: ProductLineEntity[];
}

export interface StateProvinceEntity {
  code: string;
  countryCode: string;
  name: string;
}

export interface DepartmentEntity {
  id: string;
  name: string;
}

export interface StaffRoleEntity {
  id: string;
  name: string;
}

export interface ServiceStaffRoleEntity {
  id: string;
  name: string;
}
