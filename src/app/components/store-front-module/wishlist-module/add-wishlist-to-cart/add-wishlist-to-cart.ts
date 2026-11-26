import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { WishlistItemModel } from '../wishlist-items/wishlist-items';

@Component({
  selector: 'app-add-wishlist-to-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-wishlist-to-cart.html',
  styleUrl: './add-wishlist-to-cart.css',
  host: { class: 'block w-full bg-white font-sans' },
})
export class AddWishlistToCart {
  items = input<WishlistItemModel[]>([]);
  lastAdded = input<WishlistItemModel | null>(null);
  moveAllToCart = output<void>();

  get availableItems(): WishlistItemModel[] {
    return this.items().filter(
      (item) => item.isAvailable !== false && item.inStock && item.stockCount > 0,
    );
  }

  get availableSubtotal(): number {
    return this.availableItems.reduce((sum, item) => sum + item.price, 0);
  }
}