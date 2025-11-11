import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisChipList } from './polaris-chip-list.component';

describe('PolarisChipListComponent', () => {
  let component: PolarisChipList<string>;
  let fixture: ComponentFixture<PolarisChipList<string>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisChipList],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisChipList<string>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
