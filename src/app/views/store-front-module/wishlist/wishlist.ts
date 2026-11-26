import { Component, inject, signal, viewChild } from '@angular/core';
import { AddWishlistToCart } from '../../../components/store-front-module/wishlist-module/add-wishlist-to-cart/add-wishlist-to-cart';
import {
  WishlistItemModel,
  WishlistItems,
} from '../../../components/store-front-module/wishlist-module/wishlist-items/wishlist-items';
import { UploadCartItemsService } from '../../../services/store-front-module/cart-module/upload-cart-items.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [WishlistItems, AddWishlistToCart],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
  host: { class: 'block w-full bg-white font-sans' },
})
export class Wishlist {
  private uploadCartItems = inject(UploadCartItemsService);
  protected wishlistItemsComp = viewChild(WishlistItems);

  lastAddedItem = signal<WishlistItemModel | null>(null);

  async onAddItemToCart(item: WishlistItemModel): Promise<void> {
    await this.uploadCartItems.addToCart({
      ...item,
      quantity: 1,
    });
    this.lastAddedItem.set(item);
  }

  async onMoveAllToCart(): Promise<void> {
    const comp = this.wishlistItemsComp();
    if (!comp) return;

    const availableItems = comp
      .wishlistItems()
      .filter((item) => item.inStock && item.stockCount > 0);

    for (const item of availableItems) {
      await this.uploadCartItems.addToCart({
        ...item,
        quantity: 1,
      });
    }

    if (availableItems.length > 0) {
      this.lastAddedItem.set(availableItems[availableItems.length - 1]);
      comp.clearItems();
    }
  }
}