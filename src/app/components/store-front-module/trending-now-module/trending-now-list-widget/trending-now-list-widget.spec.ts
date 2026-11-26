import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendingNowListWidget } from './trending-now-list-widget';

describe('TrendingNowListWidget', () => {
  let component: TrendingNowListWidget;
  let fixture: ComponentFixture<TrendingNowListWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingNowListWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrendingNowListWidget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
