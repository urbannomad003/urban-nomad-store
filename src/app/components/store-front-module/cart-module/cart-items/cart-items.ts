import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, output, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AddCartItemModel } from '../../../../models/store-front-module/cart/add-cart-item.model';
import { RetrieveCartItemsService } from '../../../../services/store-front-module/cart-module/retrieve-cart-items.service';
import { UploadCartItemsService } from '../../../../services/store-front-module/cart-module/upload-cart-items.service';
import { UploadWishlistItemsService } from '../../../../services/store-front-module/wishlist-module/upload-wishlist-items.service';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-items.html',
  styleUrl: './cart-items.css',
  host: { class: 'block w-full bg-white font-sans' },
})
export class CartItems implements OnInit {
  itemsChanged = output<AddCartItemModel[]>();
  movedToWishlist = output<AddCartItemModel>();

  private readonly auth = inject(Auth);
  private readonly retrieveCartItems = inject(RetrieveCartItemsService);
  private readonly uploadCartItems = inject(UploadCartItemsService);
  private readonly uploadWishlistItems = inject(UploadWishlistItemsService);

  items = this.retrieveCartItems.items;
  isLoading = signal(true);
  removingId = signal<string | null>(null);
  movingId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const currentItems = this.items();
      this.itemsChanged.emit(currentItems);
    });
  }

  ngOnInit(): void {
    this.retrieveCartItems.getCartItems().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  isItemBusy(productId: string): boolean {
    return this.removingId() === productId || this.movingId() === productId;
  }

  async decreaseQuantity(item: AddCartItemModel): Promise<void> {
    if (item.quantity <= 1 || this.isItemBusy(item.productId)) return;
    await this.uploadCartItems.updateQuantity(item.productId, item.quantity - 1);
  }

  async increaseQuantity(item: AddCartItemModel): Promise<void> {
    if (item.isAvailable === false || this.isItemBusy(item.productId)) return;
    await this.uploadCartItems.updateQuantity(item.productId, item.quantity + 1);
  }

  async removeItem(item: AddCartItemModel): Promise<void> {
    if (this.isItemBusy(item.productId)) return;
    this.removingId.set(item.productId);
    try {
      await this.uploadCartItems.removeFromCart(item.productId);
    } finally {
      this.removingId.set(null);
    }
  }

  async moveToList(item: AddCartItemModel): Promise<void> {
    const uid = this.auth.currentUser?.uid;
    if (!uid || item.isAvailable === false || this.isItemBusy(item.productId)) return;

    this.movingId.set(item.productId);
    try {
      await this.uploadWishlistItems.addToWishlist(uid, {
        productId: item.productId,
        name: item.name,
        price: item.price,
        initialPrice: item.initialPrice,
        isDiscounted: item.isDiscounted,
        image: item.image,
        rating: item.rating,
        inStock: item.inStock ?? true,
        stockCount: item.stockCount ?? 0,
        section: item.section,
        color: item.color,
        size: item.size,
        unit: item.unit,
      });
      await this.uploadCartItems.removeFromCart(item.productId);
      this.movedToWishlist.emit(item);
    } catch (error) {
      console.error('[CartItems] Failed to move item to wishlist:', error);
    } finally {
      this.movingId.set(null);
    }
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

  formatSection(section: string): string {
    return section
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}