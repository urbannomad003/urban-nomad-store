import {
  EnvironmentInjector,
  Injectable,
  OnDestroy,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { StorefrontWishlistItem } from './upload-wishlist-items.service';

@Injectable({
  providedIn: 'root',
})
export class RetrieveWishlistItemsService implements OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);

  private readonly wishlistItemsSignal = signal<StorefrontWishlistItem[]>([]);
  private unsubscribeAuth?: () => void;
  private unsubscribeSnapshot?: () => void;
  private syncVersion = 0;

  readonly items = this.wishlistItemsSignal.asReadonly();

  constructor() {
    this.startLiveSync();
  }

  private startLiveSync(explicitUserId?: string | null): void {
    this.unsubscribeAuth?.();
    this.unsubscribeSnapshot?.();

    if (explicitUserId !== undefined) {
      this.subscribeToUserWishlist(explicitUserId ?? null);
      return;
    }

    const initialUid = this.auth.currentUser?.uid ?? null;
    this.subscribeToUserWishlist(initialUid);

    this.unsubscribeAuth = runInInjectionContext(this.envInjector, () =>
      onAuthStateChanged(this.auth, (user) => {
        this.subscribeToUserWishlist(user?.uid ?? null);
      }),
    );
  }

  private async verifyProductsExist(
    items: StorefrontWishlistItem[],
    version: number,
  ): Promise<StorefrontWishlistItem[]> {
    return Promise.all(
      items.map(async (item) => {
        if (!item.productId) {
          return { ...item, isAvailable: false, inStock: false, stockCount: 0 };
        }

        try {
          const snap = await runInInjectionContext(this.envInjector, () =>
            getDoc(doc(this.firestore, 'products', item.productId)),
          );
          if (version !== this.syncVersion) return item;

          if (!snap.exists()) {
            return {
              ...item,
              isAvailable: false,
              inStock: false,
              stockCount: 0,
            };
          }

          return {
            ...item,
            isAvailable: true,
          };
        } catch (err) {
          console.error(
            `[RetrieveWishlistItemsService] Product check failed for ${item.productId}:`,
            err,
          );
          return {
            ...item,
            isAvailable: false,
            inStock: false,
            stockCount: 0,
          };
        }
      }),
    );
  }

  private subscribeToUserWishlist(userId: string | null): void {
    this.unsubscribeSnapshot?.();
    const version = ++this.syncVersion;

    if (!userId) {
      this.wishlistItemsSignal.set([]);
      return;
    }

    this.unsubscribeSnapshot = runInInjectionContext(this.envInjector, () => {
      const q = query(
        collection(this.firestore, 'wishlists', userId, 'items'),
        orderBy('addedAt', 'desc'),
      );

      return onSnapshot(
        q,
        async (snapshot) => {
          const mapped: StorefrontWishlistItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Partial<StorefrontWishlistItem>;
            const price = Number(data.price ?? 0);
            const initialPrice = Number(data.initialPrice ?? price);

            return {
              productId: String(data.productId ?? docSnap.id),
              name: String(data.name ?? 'Untitled Product'),
              price,
              initialPrice,
              isDiscounted: Boolean(data.isDiscounted ?? initialPrice > price),
              image: String(data.image ?? ''),
              rating: data.rating !== undefined ? Number(data.rating) : 0,
              inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
              stockCount: Number(data.stockCount ?? 0),
              isAvailable: true,
              section: data.section,
              color: data.color,
              colors: data.colors,
              size: data.size !== undefined ? Number(data.size) : undefined,
              unit: data.unit,
              addedAt: String(data.addedAt ?? new Date().toISOString()),
            };
          });

          const verified = await this.verifyProductsExist(mapped, version);
          if (version === this.syncVersion) {
            this.wishlistItemsSignal.set(verified);
          }
        },
        (error) => {
          console.error('[RetrieveWishlistItemsService] Snapshot error:', error);
          this.wishlistItemsSignal.set([]);
        },
      );
    });
  }

  getWishlistItems(userId?: string | null): Observable<StorefrontWishlistItem[]> {
    if (userId !== undefined) {
      this.subscribeToUserWishlist(userId);
    }

    return new Observable<StorefrontWishlistItem[]>((subscriber) => {
      subscriber.next(this.wishlistItemsSignal());
      subscriber.complete();
    });
  }

  setItems(items: StorefrontWishlistItem[]): void {
    this.wishlistItemsSignal.set(items);
  }

  ngOnDestroy(): void {
    this.syncVersion++;
    this.unsubscribeSnapshot?.();
    this.unsubscribeAuth?.();
  }
}