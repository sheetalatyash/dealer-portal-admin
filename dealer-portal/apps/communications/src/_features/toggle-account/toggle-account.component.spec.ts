import { ToggleAccountComponent } from './toggle-account.component';
import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { By } from '@angular/platform-browser';

describe('ToggleAccountComponent', () => {
  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(ToggleAccountComponent));

  it('constructs component', () => {
    // act
    const fixture = MockRender(ToggleAccountComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });

  it('Display title of the page', () => {
    // act
    const fixture = MockRender(ToggleAccountComponent);
    const component = fixture.point.componentInstance;
    const element = fixture.debugElement.query(By.css('*[data-test-id="user-administration-title"]')).nativeElement;

    // assert
    expect(component.title).toBeDefined();
    expect(element.textContent).toContain(component.title);
  });
});
