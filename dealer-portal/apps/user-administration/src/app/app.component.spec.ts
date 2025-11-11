import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  MockInstance.scope('suite');

  beforeEach(() => MockBuilder(AppComponent));

  it('constructs component', () => {
    // arrange

    // act
    const fixture = MockRender(AppComponent);
    const component = fixture.point.componentInstance;

    // assert
    expect(component).toBeDefined();
  });
});
