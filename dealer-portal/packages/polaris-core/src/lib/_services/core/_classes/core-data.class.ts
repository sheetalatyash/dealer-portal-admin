import { CoreDataEntity, ProductLineByBusinessUnitEntity } from '../../../_apis/core';
import {
  Country,
  CustomerClass,
  Department,
  Language,
  PartnerType,
  ProductLineByBusinessUnit,
  ProductLineByFamily,
  ServiceStaffRole,
  StaffRole,
  StateProvince,
} from '../_classes';

export class CoreData {
  public countries: Country[] = [];
  public customerClasses: CustomerClass[] = [];
  public departments: Department[] = [];
  public languages: Language[] = [];
  public partnerTypes: PartnerType[] = [];
  public productLinesByFamily: ProductLineByFamily[] = [];
  public productLinesByBusinessUnit: ProductLineByBusinessUnit[] = [];
  public serviceStaffRoles: ServiceStaffRole[] = [];
  public staffRoles: StaffRole[] = [];
  public stateProvinces: StateProvince[] = [];

  constructor(private _entity: Partial<CoreDataEntity> = {}) {
    this.countries = _entity?.countries ? _entity.countries?.map((data) => new Country(data)) : [];
    this.customerClasses = _entity?.customerClasses
      ? _entity.customerClasses?.map((data) => new CustomerClass(data))
      : [];
    this.departments = _entity.departments ? _entity.departments.map((data) => new Department(data)) : [];
    this.languages = _entity?.languages ? _entity.languages?.map((data) => new Language(data)) : [];
    this.partnerTypes = _entity?.partnerTypes ? _entity.partnerTypes?.map((data) => new PartnerType(data)) : [];
    this.productLinesByFamily = _entity?.productLinesByProductFamily
      ? _entity.productLinesByProductFamily?.map((data) => new ProductLineByFamily(data))
      : [];
    this.productLinesByBusinessUnit = _entity?.productLinesByBusinessUnit
      ? _entity.productLinesByBusinessUnit?.map(
          (data: ProductLineByBusinessUnitEntity) => new ProductLineByBusinessUnit(data),
        )
      : [];
    this.serviceStaffRoles = _entity?.serviceStaffRoles
      ? _entity.serviceStaffRoles?.map((data) => new ServiceStaffRole(data))
      : [];
    this.staffRoles = _entity?.staffRoles ? _entity.staffRoles?.map((data) => new StaffRole(data)) : [];
    this.stateProvinces = _entity?.stateProvinces ? _entity.stateProvinces?.map((data) => new StateProvince(data)) : [];
  }
}
