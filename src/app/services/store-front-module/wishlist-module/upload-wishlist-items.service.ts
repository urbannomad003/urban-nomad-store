import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface StorefrontWishlistItem {
  productId: string;
  name: string;
  price: number;
  initialPrice?: number;
  isDiscounted?: boolean;
  image: string;
  rating?: number;
  inStock: boolean;
  stockCount: number;
  isAvailable?: boolean;
  section?: string;
  color?: string;
  colors?: string[];
  size?: number;
  unit?: string;
  addedAt: string;
}

export type NewStorefrontWishlistItem = Omit<StorefrontWishlistItem, 'addedAt'>;

@Injectable({
  providedIn: 'root',
})
export class UploadWishlistItemsService {
  private readonly firestore = inject(Firestore);
  private readonly envInjector = inject(EnvironmentInjector);

  private parentRef(userId: string) {
    return runInInjectionContext(this.envInjector, () =>
      doc(this.firestore, 'wishlists', userId),
    );
  }

  private itemRef(userId: string, productId: string) {
    return runInInjectionContext(this.envInjector, () =>
      doc(this.firestore, 'wishlists', userId, 'items', productId),
    );
  }

  private async ensureParentDoc(userId: string): Promise<void> {
    const parent = this.parentRef(userId);
    const snap = await runInInjectionContext(this.envInjector, () => getDoc(parent));
    if (!snap.exists()) {
      await runInInjectionContext(this.envInjector, () =>
        setDoc(parent, { userId, createdAt: new Date().toISOString() }),
      );
    }
  }

  getWishlistItems(userId: string): Observable<StorefrontWishlistItem[]> {
    return new Observable<StorefrontWishlistItem[]>((subscriber) => {
      try {
        const q = runInInjectionContext(this.envInjector, () =>
          query(
            collection(this.firestore, 'wishlists', userId, 'items'),
            orderBy('addedAt', 'desc'),
          ),
        );

        const unsubscribe = runInInjectionContext(this.envInjector, () =>
          onSnapshot(
            q,
            (snapshot) => {
              const items: StorefrontWishlistItem[] = [];
              snapshot.forEach((docSnap) => {
                items.push({
                  productId: docSnap.id,
                  ...(docSnap.data() as Omit<StorefrontWishlistItem, 'productId'>),
                });
              });
              subscriber.next(items);
            },
            (error) => {
              console.error('[UploadWishlistItemsService] Snapshot error:', error);
              subscriber.next([]);
            },
          ),
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('[UploadWishlistItemsService] Stream setup error:', err);
        subscriber.next([]);
        return () => {};
      }
    });
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const ref = this.itemRef(userId, productId);
    const snap = await runInInjectionContext(this.envInjector, () => getDoc(ref));
    return snap.exists();
  }

  async addToWishlist(userId: string, item: NewStorefrontWishlistItem): Promise<void> {
    await this.ensureParentDoc(userId);
    const ref = this.itemRef(userId, String(item.productId));

    const payload: StorefrontWishlistItem = {
      productId: String(item.productId),
      name: item.name,
      price: item.price,
      initialPrice: item.initialPrice ?? item.price,
      isDiscounted: item.isDiscounted ?? false,
      image: item.image,
      rating: item.rating ?? 0,
      inStock: item.inStock,
      stockCount: item.stockCount,
      section: item.section ?? 'FEATURED_PRODUCTS_ON_SALE',
      addedAt: new Date().toISOString(),
    };

    if (item.color !== undefined) payload.color = item.color;
    if (item.colors !== undefined) payload.colors = item.colors;
    if (item.size !== undefined) payload.size = item.size;
    if (item.unit !== undefined) payload.unit = item.unit;

    await runInInjectionContext(this.envInjector, () => setDoc(ref, payload));
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const ref = this.itemRef(userId, productId);
    await runInInjectionContext(this.envInjector, () => deleteDoc(ref));
  }

  async toggleWishlist(userId: string, item: NewStorefrontWishlistItem): Promise<boolean> {
    const inList = await this.isInWishlist(userId, String(item.productId));
    if (inList) {
      await this.removeFromWishlist(userId, String(item.productId));
      return false;
    }
    await this.addToWishlist(userId, item);
    return true;
  }
}