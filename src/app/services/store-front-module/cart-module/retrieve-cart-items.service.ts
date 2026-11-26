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
import { AddCartItemModel } from '../../../models/store-front-module/cart/add-cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class RetrieveCartItemsService implements OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);

  private readonly cartItemsSignal = signal<AddCartItemModel[]>([]);
  private unsubscribeAuth?: () => void;
  private unsubscribeSnapshot?: () => void;
  private syncVersion = 0;

  readonly items = this.cartItemsSignal.asReadonly();

  constructor() {
    this.startLiveSync();
  }

  private startLiveSync(explicitUserId?: string | null): void {
    this.unsubscribeAuth?.();
    this.unsubscribeSnapshot?.();

    if (explicitUserId !== undefined) {
      this.subscribeToUserCart(explicitUserId ?? null);
      return;
    }

    const initialUid = this.auth.currentUser?.uid ?? null;
    this.subscribeToUserCart(initialUid);

    this.unsubscribeAuth = runInInjectionContext(this.envInjector, () =>
      onAuthStateChanged(this.auth, (user) => {
        this.subscribeToUserCart(user?.uid ?? null);
      }),
    );
  }

  private async verifyProductsExist(
    items: AddCartItemModel[],
    version: number,
  ): Promise<AddCartItemModel[]> {
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
            `[RetrieveCartItemsService] Product check failed for ${item.productId}:`,
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

  private subscribeToUserCart(userId: string | null): void {
    this.unsubscribeSnapshot?.();
    const version = ++this.syncVersion;

    if (!userId) {
      this.cartItemsSignal.set([]);
      return;
    }

    this.unsubscribeSnapshot = runInInjectionContext(this.envInjector, () => {
      const q = query(
        collection(this.firestore, 'carts', userId, 'items'),
        orderBy('addedAt', 'desc'),
      );

      return onSnapshot(
        q,
        async (snapshot) => {
          const mapped: AddCartItemModel[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Partial<AddCartItemModel>;
            const price = Number(data.price ?? 0);
            const initialPrice = Number(data.initialPrice ?? price);
            const stockCount = Number(data.stockCount ?? 0);

            return {
              productId: String(data.productId ?? docSnap.id),
              name: String(data.name ?? 'Untitled Product'),
              price,
              initialPrice,
              isDiscounted: Boolean(data.isDiscounted ?? initialPrice > price),
              image: String(data.image ?? ''),
              quantity: Math.max(1, Number(data.quantity ?? 1)),
              addedAt: String(data.addedAt ?? new Date().toISOString()),
              rating: Number(data.rating ?? 0),
              inStock: data.inStock !== undefined ? Boolean(data.inStock) : stockCount > 0,
              stockCount,
              isAvailable: true,
              section: String(data.section ?? ''),
              color: data.color,
              size: data.size !== undefined ? Number(data.size) : undefined,
              unit: data.unit,
            };
          });

          const verified = await this.verifyProductsExist(mapped, version);
          if (version === this.syncVersion) {
            this.cartItemsSignal.set(verified);
          }
        },
        (error) => {
          console.error('[RetrieveCartItemsService] Snapshot error:', error);
          this.cartItemsSignal.set([]);
        },
      );
    });
  }

  getCartItems(userId?: string | null): Observable<AddCartItemModel[]> {
    if (userId !== undefined) {
      this.subscribeToUserCart(userId);
    }

    return new Observable<AddCartItemModel[]>((subscriber) => {
      subscriber.next(this.cartItemsSignal());
      subscriber.complete();
    });
  }

  setItems(items: AddCartItemModel[]): void {
    this.cartItemsSignal.set(items);
  }

  ngOnDestroy(): void {
    this.syncVersion++;
    this.unsubscribeSnapshot?.();
    this.unsubscribeAuth?.();
  }
}