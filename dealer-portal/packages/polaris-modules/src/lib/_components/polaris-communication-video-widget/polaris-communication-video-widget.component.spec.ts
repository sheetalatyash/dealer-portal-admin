import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PolarisCommunicationVideoWidgetComponent } from './polaris-communication-video-widget.component';

describe('PolarisCommunicationVideoWidgetComponent', () => {
  let component: PolarisCommunicationVideoWidgetComponent;
  let fixture: ComponentFixture<PolarisCommunicationVideoWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarisCommunicationVideoWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PolarisCommunicationVideoWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
