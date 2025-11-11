import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisHref } from './polaris-href.component';

describe('PolarisHref', () => {
  let component: PolarisHref;
  let fixture: ComponentFixture<PolarisHref>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisHref],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisHref);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
