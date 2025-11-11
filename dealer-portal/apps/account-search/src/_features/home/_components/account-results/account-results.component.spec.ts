import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountResultsComponent } from './account-results.component';

describe('AccountListComponent', () => {
  let component: AccountResultsComponent;
  let fixture: ComponentFixture<AccountResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
