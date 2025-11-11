import { UserAdministrationComponent } from '@components/_views';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('UserAdministrationComponent', () => {
  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(UserAdministrationComponent));

  it('constructs component', () => {
    // act
    const fixture = MockRender(UserAdministrationComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });

  it('Display title of the page', () => {
    // act
    const fixture = MockRender(UserAdministrationComponent);
    const component = fixture.point.componentInstance;
    const element = fixture.debugElement.query(By.css('*[data-test-id="user-administration-title"]')).nativeElement;

    // assert
    expect(component.title).toBeDefined();
    expect(element.textContent).toContain(component.title);
  });
});
