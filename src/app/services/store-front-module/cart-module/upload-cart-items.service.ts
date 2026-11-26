import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface StorefrontCartItem {
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
  quantity: number;
  addedAt: string;
}

export type NewStorefrontCartItem = Omit<StorefrontCartItem, 'addedAt' | 'quantity'> & {
  quantity?: number;
};

@Injectable({
  providedIn: 'root',
})
export class UploadCartItemsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);

  private resolveUserId(explicitUserId?: string): string {
    const uid = explicitUserId ?? this.auth.currentUser?.uid;
    if (!uid) {
      throw new Error('[UploadCartItemsService] No authenticated user found.');
    }
    return uid;
  }

  private parentRef(userId: string) {
    return runInInjectionContext(this.envInjector, () =>
      doc(this.firestore, 'carts', userId),
    );
  }

  private itemRef(userId: string, productId: string) {
    return runInInjectionContext(this.envInjector, () =>
      doc(this.firestore, 'carts', userId, 'items', productId),
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

  getCartItems(explicitUserId?: string): Observable<StorefrontCartItem[]> {
    return new Observable<StorefrontCartItem[]>((subscriber) => {
      try {
        const userId = explicitUserId ?? this.auth.currentUser?.uid;
        if (!userId) {
          subscriber.next([]);
          return () => {};
        }

        const q = runInInjectionContext(this.envInjector, () =>
          query(
            collection(this.firestore, 'carts', userId, 'items'),
            orderBy('addedAt', 'desc'),
          ),
        );

        const unsubscribe = runInInjectionContext(this.envInjector, () =>
          onSnapshot(
            q,
            (snapshot) => {
              const items: StorefrontCartItem[] = [];
              snapshot.forEach((docSnap) => {
                items.push({
                  productId: docSnap.id,
                  ...(docSnap.data() as Omit<StorefrontCartItem, 'productId'>),
                });
              });
              subscriber.next(items);
            },
            (error) => {
              console.error('[UploadCartItemsService] Snapshot error:', error);
              subscriber.next([]);
            },
          ),
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('[UploadCartItemsService] Stream setup error:', err);
        subscriber.next([]);
        return () => {};
      }
    });
  }

  async addToCart(
    itemOrUserId: NewStorefrontCartItem | string,
    itemOrQuantity?: NewStorefrontCartItem | number,
    quantity = 1,
  ): Promise<void> {
    const isExplicitUser = typeof itemOrUserId === 'string';
    const userId = this.resolveUserId(isExplicitUser ? itemOrUserId : undefined);
    const item = (isExplicitUser ? itemOrQuantity : itemOrUserId) as NewStorefrontCartItem;
    const qty = isExplicitUser
      ? quantity
      : typeof itemOrQuantity === 'number'
        ? itemOrQuantity
        : (item.quantity ?? 1);

    await this.ensureParentDoc(userId);
    const ref = this.itemRef(userId, String(item.productId));

    const payload: Record<string, unknown> = {
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
      quantity: runInInjectionContext(this.envInjector, () => increment(qty)),
      addedAt: new Date().toISOString(),
    };

    if (item.color !== undefined) payload['color'] = item.color;
    if (item.colors !== undefined) payload['colors'] = item.colors;
    if (item.size !== undefined) payload['size'] = item.size;
    if (item.unit !== undefined) payload['unit'] = item.unit;

    await runInInjectionContext(this.envInjector, () =>
      setDoc(ref, payload, { merge: true }),
    );
  }

  async updateQuantity(
    productIdOrUserId: string,
    quantityOrProductId: number | string,
    explicitQuantity?: number,
  ): Promise<void> {
    const hasExplicitUser = typeof quantityOrProductId === 'string';
    const userId = this.resolveUserId(hasExplicitUser ? productIdOrUserId : undefined);
    const productId = hasExplicitUser ? quantityOrProductId : productIdOrUserId;
    const quantity = hasExplicitUser ? (explicitQuantity ?? 1) : quantityOrProductId;

    if (quantity < 1) {
      return this.removeFromCart(userId, productId);
    }
    const ref = this.itemRef(userId, productId);
    await runInInjectionContext(this.envInjector, () => updateDoc(ref, { quantity }));
  }

  async removeFromCart(productIdOrUserId: string, explicitProductId?: string): Promise<void> {
    const hasExplicitUser = explicitProductId !== undefined;
    const userId = this.resolveUserId(hasExplicitUser ? productIdOrUserId : undefined);
    const productId = hasExplicitUser ? explicitProductId : productIdOrUserId;

    const ref = this.itemRef(userId, productId);
    await runInInjectionContext(this.envInjector, () => deleteDoc(ref));
  }

  async clearCart(productIdsOrUserId: string[] | string, explicitProductIds?: string[]): Promise<void> {
    const hasExplicitUser = typeof productIdsOrUserId === 'string';
    const userId = this.resolveUserId(hasExplicitUser ? productIdsOrUserId : undefined);
    const productIds = (hasExplicitUser ? explicitProductIds : productIdsOrUserId) ?? [];

    await Promise.all(productIds.map((id) => this.removeFromCart(userId, id)));
  }
}