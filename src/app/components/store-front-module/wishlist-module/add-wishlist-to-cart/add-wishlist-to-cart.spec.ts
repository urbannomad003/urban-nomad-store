import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWishlistToCart } from './add-wishlist-to-cart';

describe('AddWishlistToCart', () => {
  let component: AddWishlistToCart;
  let fixture: ComponentFixture<AddWishlistToCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWishlistToCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWishlistToCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
