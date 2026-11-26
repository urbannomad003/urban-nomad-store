import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, output, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { RetrieveWishlistItemsService } from '../../../../services/store-front-module/wishlist-module/retrieve-wishlist-items.service';
import { UploadCartItemsService } from '../../../../services/store-front-module/cart-module/upload-cart-items.service';
import {
  StorefrontWishlistItem,
  UploadWishlistItemsService,
} from '../../../../services/store-front-module/wishlist-module/upload-wishlist-items.service';

export type WishlistItemModel = StorefrontWishlistItem;

interface ToastItem {
  id: number;
  message: string;
}

@Component({
  selector: 'app-wishlist-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist-items.html',
  styleUrl: './wishlist-items.css',
  host: {
    class: 'block w-full bg-white py-8 font-sans text-stone-900',
  },
})
export class WishlistItems implements OnInit {
  addedToCart = output<WishlistItemModel>();
  removed = output<WishlistItemModel>();

  private readonly auth = inject(Auth);
  private readonly retrieveWishlist = inject(RetrieveWishlistItemsService);
  private readonly uploadWishlist = inject(UploadWishlistItemsService);
  private readonly uploadCart = inject(UploadCartItemsService);

  activeToasts = signal<ToastItem[]>([]);
  private toastIdCounter = 0;

  isLoading = signal(true);
  addingToCartId = signal<string | null>(null);
  removingId = signal<string | null>(null);

  wishlistItems = this.retrieveWishlist.items;

  ngOnInit(): void {
    this.retrieveWishlist.getWishlistItems().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  isItemBusy(productId: string): boolean {
    return this.addingToCartId() === productId || this.removingId() === productId;
  }

  async addToCart(item: WishlistItemModel): Promise<void> {
    if (!item.inStock || item.stockCount <= 0 || this.isItemBusy(item.productId)) return;

    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      this.triggerToast('Sign in to add items to cart');
      return;
    }

    this.addingToCartId.set(item.productId);
    try {
      await this.uploadCart.addToCart(
        uid,
        {
          productId: item.productId,
          name: item.name,
          price: item.price,
          initialPrice: item.initialPrice ?? item.price,
          isDiscounted: item.isDiscounted ?? false,
          image: item.image,
          rating: item.rating ?? 0,
          inStock: item.inStock,
          stockCount: item.stockCount,
          section: item.section,
          color: item.color,
          colors: item.colors,
          size: item.size,
          unit: item.unit,
        },
        1,
      );
      this.addedToCart.emit(item);
      this.triggerToast('Item Added To Cart');
    } catch (error) {
      console.error('[WishlistItems] Failed to add item to cart:', error);
    } finally {
      this.addingToCartId.set(null);
    }
  }

  async removeItem(productId: string): Promise<void> {
    if (this.isItemBusy(productId)) return;

    const uid = this.auth.currentUser?.uid;
    if (!uid) {
      this.triggerToast('Sign in to update wishlist');
      return;
    }

    const target = this.wishlistItems().find((i) => i.productId === productId);
    this.removingId.set(productId);
    try {
      await this.uploadWishlist.removeFromWishlist(uid, productId);
      if (target) {
        this.removed.emit(target);
      }
      this.triggerToast('Item Removed From Wishlist');
    } catch (error) {
      console.error('[WishlistItems] Failed to remove item from wishlist:', error);
    } finally {
      this.removingId.set(null);
    }
  }

  clearItems(): void {
    this.retrieveWishlist.setItems([]);
  }

  private triggerToast(message: string): void {
    const currentId = ++this.toastIdCounter;
    this.activeToasts.update((list) => [...list, { id: currentId, message }]);
    setTimeout(() => {
      this.activeToasts.update((list) => list.filter((t) => t.id !== currentId));
    }, 1800);
  }

  formatSection(section: string): string {
    return section
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getStars(rating: number | undefined): number[] {
    const r = rating || 0;
    const stars: number[] = [];
    for (let i = 1; i <= 5; i++) {
      if (r >= i) stars.push(1);
      else if (r >= i - 0.5) stars.push(0.5);
      else stars.push(0);
    }
    return stars;
  }
}