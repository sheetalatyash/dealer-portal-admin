import { SalesUserAccount } from '@dealer-portal/polaris-core';

abstract class SalesUserAccountUser {
  public first?: string = '';
  public last?: string = '';
  public portalId?: string = '';
  public role?: string = '';
  public username?: string = '';

  constructor(first = '', last = '', portalId = '', role = '', username = '') {
    this.first = first;
    this.last = last;
    this.portalId = portalId;
    this.role = role;
    this.username = username;
  }
}

export class SalesUserAccountUserDOS extends SalesUserAccountUser {
  constructor(private _entity: Partial<SalesUserAccount> = {}) {
    super(
      _entity.level3SalesUserFirstName,
      _entity.level3SalesUserLastName,
      _entity.level3SalesUserPortalId,
      _entity.level3SalesUserRoleName,
      _entity.level3SalesUserDomainUsername
    );
  }
}

export class SalesUserAccountUserRSM extends SalesUserAccountUser {
  constructor(private _entity: Partial<SalesUserAccount> = {}) {
    super(
      _entity.level2SalesUserFirstName,
      _entity.level2SalesUserLastName,
      _entity.level2SalesUserPortalId,
      _entity.level2SalesUserRoleName,
      _entity.level2SalesUserDomainUsername
    );
  }
}

export class SalesUserAccountUserSLM extends SalesUserAccountUser {
  constructor(private _entity: Partial<SalesUserAccount> = {}) {
    super(
      _entity.level1SalesUserFirstName,
      _entity.level1SalesUserLastName,
      _entity.level1SalesUserPortalId,
      _entity.level1SalesUserRoleName,
      _entity.level1SalesUserDomainUsername
    );
  }
}
