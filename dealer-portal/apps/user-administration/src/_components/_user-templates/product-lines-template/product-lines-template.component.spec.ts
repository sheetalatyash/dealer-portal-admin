import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductLinesTemplateComponent } from '@components/_user-templates';

describe('ProductLinesTemplateComponent', () => {
  let component: ProductLinesTemplateComponent;
  let fixture: ComponentFixture<ProductLinesTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductLinesTemplateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductLinesTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
