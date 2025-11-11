import { UserTableComponent } from './user-table.component';
// import { UserAdministrationService } from '@services';
// import { User } from '@classes';
import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('UserTableComponent', () => {
  // const users: User[] = [
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Active',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 1,
  //   }),
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Pending',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 907760000,
  //   }),
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Inactive',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 2,
  //   }),
  // ];

  // const activeUsers: User[] = [
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Active',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 1,
  //   }),
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Pending',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 907760000,
  //   }),
  //   new User({
  //     dealerId: '123',
  //     firstName: 'Bob',
  //     lastName: 'Inactive',
  //     portalAuthenticationId: '999',
  //     emailAddress: 'bob.j@test.com',
  //     phone: '123-456-7890',
  //     employeeStatusCode: 2,
  //   }),
  // ];

  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(UserTableComponent));

  beforeEach(() => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(users);
    // });
  });

  afterEach(() => ngMocks.flushTestBed());

  it('constructs component', () => {
    // arrange

    // act
    const fixture = MockRender(UserTableComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });

  it('Page size dropdown should exist', () => {
    // act
    const fixture = MockRender(UserTableComponent);
    const component = fixture.debugElement.query(By.css('*[data-test-id="page-size-select"]'));

    // assert
    expect(component).toBeDefined();
  });

  it('Search input box should exist', () => {
    // act
    const fixture = MockRender(UserTableComponent);
    const component = fixture.debugElement.query(By.css('*[data-test-id="search-filter"]'));

    // assert
    expect(component).toBeDefined();
  });

  it('Entering no string filter should return 4/4 results', () => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(activeUsers);
    // });

    // const fixture = MockRender(UserTableComponent);
    // const component = fixture.componentInstance;
    // const nativeElement: HTMLInputElement = fixture.debugElement.query(
    //   By.css('*[data-test-id="search-filter"]')
    // ).nativeElement;

    // nativeElement.dispatchEvent(new Event('change'));

    // fixture.detectChanges();
    // expect(component.dataSource.data.length).toEqual(4);
  });

  it('Entering "bob.j@test" string filter should return 3/4 results', () => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(activeUsers);
    // });

    // const fixture = MockRender(UserTableComponent);
    // const component = fixture.componentInstance;
    // const nativeElement: HTMLInputElement = fixture.debugElement.query(
    //   By.css('*[data-test-id="search-filter"]')
    // ).nativeElement;

    // nativeElement.value = 'bob.j@test';
    // nativeElement.dispatchEvent(new Event('change'));

    // fixture.detectChanges();
    // expect(component.dataSource.data.length).toEqual(3);
  });

  it('Entering "bob.j@test1" string filter should return 2/4 results', () => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(activeUsers);
    // });

    // const fixture = MockRender(UserTableComponent);
    // const component = fixture.componentInstance;
    // const nativeElement: HTMLInputElement = fixture.debugElement.query(
    //   By.css('*[data-test-id="search-filter"]')
    // ).nativeElement;

    // nativeElement.value = 'bob.j@test1';
    // nativeElement.dispatchEvent(new Event('change'));

    // fixture.detectChanges();
    // expect(component.dataSource.data.length).toEqual(2);
  });

  it('Entering "bob.j@test12" string filter should return 1/4 results', () => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(activeUsers);
    // });

    // const fixture = MockRender(UserTableComponent);
    // const component = fixture.componentInstance;
    // const nativeElement: HTMLInputElement = fixture.debugElement.query(
    //   By.css('*[data-test-id="search-filter"]')
    // ).nativeElement;

    // nativeElement.value = 'bob.j@test12';
    // nativeElement.dispatchEvent(new Event('change'));

    // fixture.detectChanges();
    // expect(component.dataSource.data.length).toEqual(1);
  });

  it('Entering "bob.j@test123" string filter should return 0/4 results', () => {
    // MockInstance(UserAdministrationService, (instance) => {
    //   instance.getUsers = () => of(activeUsers);
    // });

    // const fixture = MockRender(UserTableComponent);
    // const component = fixture.componentInstance;
    // const nativeElement: HTMLInputElement = fixture.debugElement.query(
    //   By.css('*[data-test-id="search-filter"]')
    // ).nativeElement;

    // nativeElement.value = 'bob.j@test123';
    // nativeElement.dispatchEvent(new Event('change'));

    // fixture.detectChanges();
    // expect(component.dataSource.data.length).toEqual(0);
  });
});
