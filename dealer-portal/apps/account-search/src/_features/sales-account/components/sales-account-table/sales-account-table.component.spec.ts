import { SalesAccountTableComponent } from './sales-account-table.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('SalesAccountTableComponent', () => {
  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(SalesAccountTableComponent));

  it('constructs component', () => {
    // act
    const fixture = MockRender(SalesAccountTableComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });

  it('Display title of the page', () => {
    // act
    const fixture = MockRender(SalesAccountTableComponent);
    const component = fixture.point.componentInstance;
    const element = fixture.debugElement.query(By.css('*[data-test-id="sales-account-title"]')).nativeElement;

    // assert
    expect(component.salesAccounts).toBeDefined();
    expect(element.textContent).toContain(component.salesAccounts);
  });
});
