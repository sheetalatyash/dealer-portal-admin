import { SalesAccountComponent } from './sales-account.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('SalesAccountComponent', () => {
  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(SalesAccountComponent));

  it('constructs component', () => {
    // act
    const fixture = MockRender(SalesAccountComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });

  it('Display title of the page', () => {
    // act
    const fixture = MockRender(SalesAccountComponent);
    const component = fixture.point.componentInstance;
    const element = fixture.debugElement.query(By.css('*[data-test-id="sales-account-title"]')).nativeElement;

    // assert
    expect(component.title).toBeDefined();
    expect(element.textContent).toContain(component.title);
  });
});
