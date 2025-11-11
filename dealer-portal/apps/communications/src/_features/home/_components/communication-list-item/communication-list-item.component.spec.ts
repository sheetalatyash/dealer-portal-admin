import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Communication } from '@dealer-portal/polaris-core';
import { CommunicationListItemComponent } from './communication-list-item.component';

describe('CommunicationListItemComponent', () => {
  let component: CommunicationListItemComponent;
  let fixture: ComponentFixture<CommunicationListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationListItemComponent);
    component = fixture.componentInstance;
    component.communication = new Communication();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
