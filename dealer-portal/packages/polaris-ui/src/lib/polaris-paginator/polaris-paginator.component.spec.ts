import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisPaginator } from './polaris-paginator.component';

describe('PolarisPaginatorComponent', () => {
  let component: PolarisPaginator;
  let fixture: ComponentFixture<PolarisPaginator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisPaginator],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisPaginator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
