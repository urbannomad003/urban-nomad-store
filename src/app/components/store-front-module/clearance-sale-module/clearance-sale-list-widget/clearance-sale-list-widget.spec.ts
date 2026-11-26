import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearanceSaleListWidget } from './clearance-sale-list-widget';

describe('ClearanceSaleListWidget', () => {
  let component: ClearanceSaleListWidget;
  let fixture: ComponentFixture<ClearanceSaleListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearanceSaleListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearanceSaleListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
