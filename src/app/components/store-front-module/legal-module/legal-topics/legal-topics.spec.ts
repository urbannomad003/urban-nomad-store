import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalTopics } from './legal-topics';

describe('LegalTopics', () => {
  let component: LegalTopics;
  let fixture: ComponentFixture<LegalTopics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalTopics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalTopics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
