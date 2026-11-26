import {
  afterNextRender,
  Component,
  computed,
  effect,
  EnvironmentInjector,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Output,
  runInInjectionContext,
  signal,
  viewChild,
} from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  collection,
  Firestore,
  onSnapshot,
  query,
  where,
} from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { UploadCartItemsService } from '../../../../services/store-front-module/cart-module/upload-cart-items.service';
import { UploadWishlistItemsService } from '../../../../services/store-front-module/wishlist-module/upload-wishlist-items.service';

export interface TrendingProduct {
  id: string;
  name: string;
  colors: string[];
  color?: string;
  size?: number;
  unit?: string;
  /** 0 to 5 */
  rating: number;
  /** Price in rand */
  price: number;
  initialPrice?: number;
  isDiscounted?: boolean;
  /** Units in stock; 0 means out of stock */
  stock: number;
  image: string;
  /** Label shown top-left of the card, e.g. "Trending" or "For Sale" */
  tag: 'Trending' | 'For Sale';
  section: string;
}

interface FirestoreProductDoc {
  id?: string;
  title?: string;
  color?: string;
  colors?: string[];
  size?: number;
  unit?: string;
  rating?: number;
  price?: number;
  initialPrice?: number;
  stockCount?: number;
  inStock?: boolean;
  isDiscounted?: boolean;
  imageUrl?: string;
  section?: string;
  tag?: string;
}

interface ToastItem {
  id: number;
  type: 'wishlist' | 'cart';
  label: string;
}

@Component({
  selector: 'app-trending-now',
  templateUrl: './trending-now.html',
  host: { class: 'block font-sans' },
})
export class TrendingNow implements OnInit, OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly cartService = inject(UploadCartItemsService);
  private readonly wishlistService = inject(UploadWishlistItemsService);

  private track = viewChild<ElementRef<HTMLElement>>('track');
  private unsubscribeSnapshot?: () => void;
  private unsubscribeAuth?: () => void;
  private wishlistSub?: Subscription;
  private toastIdCounter = 0;

  /** Fires when the shopper presses Add To Cart on a card */
  @Output() addedToCart = new EventEmitter<TrendingProduct>();

  currentUserId = signal<string | null>(null);
  wishlist = signal<Set<string>>(new Set());
  toasts = signal<ToastItem[]>([]);
  isLoading = signal(true);
  isAddingToCart = signal(false);
  isUpdatingWishlist = signal(false);
  errorMessage = signal<string | null>(null);
  products = signal<TrendingProduct[]>([]);

  canPrev = signal(false);
  canNext = signal(false);

  isBusy = computed(() => this.isAddingToCart() || this.isUpdatingWishlist());

  stars = [1, 2, 3, 4, 5];

  constructor() {
    effect(() => {
      const uid = this.currentUserId();
      this.wishlistSub?.unsubscribe();

      if (!uid) {
        this.wishlist.set(new Set());
        return;
      }

      this.wishlistSub = this.wishlistService.getWishlistItems(uid).subscribe({
        next: (items) => {
          this.wishlist.set(new Set(items.map((item) => item.productId)));
        },
        error: (err) => {
          console.error('[TrendingNow] Wishlist stream error:', err);
        },
      });
    });

    effect(() => {
      this.products();
      queueMicrotask(() => this.updateArrows());
    });

    afterNextRender(() => this.updateArrows());
  }

  ngOnInit(): void {
    const immediateUid = this.auth.currentUser?.uid ?? null;
    if (immediateUid) {
      this.currentUserId.set(immediateUid);
    }

    this.unsubscribeAuth = runInInjectionContext(this.envInjector, () =>
      onAuthStateChanged(this.auth, (user) => {
        this.currentUserId.set(user?.uid ?? null);
      }),
    );

    this.unsubscribeSnapshot = runInInjectionContext(this.envInjector, () => {
      const productsRef = collection(this.firestore, 'products');
      const trendingQuery = query(
        productsRef,
        where('section', '==', 'TRENDING_NOW'),
      );

      return onSnapshot(
        trendingQuery,
        (snapshot) => {
          const docs: FirestoreProductDoc[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<FirestoreProductDoc, 'id'>),
          }));

          const mapped = docs.map((doc, index) => this.mapToProduct(doc, index));
          this.products.set(mapped);
          this.errorMessage.set(null);
          this.isLoading.set(false);
        },
        (err: unknown) => {
          console.error('[TrendingNow] Firestore error:', err);
          this.errorMessage.set('Unable to load trending products right now.');
          this.isLoading.set(false);
        },
      );
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeSnapshot?.();
    this.unsubscribeAuth?.();
    this.wishlistSub?.unsubscribe();
  }

  /** Slide one screen of cards left (-1) or right (1); the browser animates it smoothly */
  slide(direction: -1 | 1): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  }

  @HostListener('window:resize')
  updateArrows(): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    this.canPrev.set(el.scrollLeft > 4);
    this.canNext.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  private getActiveUid(): string | null {
    return this.auth.currentUser?.uid ?? this.currentUserId();
  }

  private resolveBadgeTag(doc: FirestoreProductDoc): 'Trending' | 'For Sale' {
    const normalizedTag = doc.tag?.trim().toLowerCase();
    if (doc.isDiscounted || normalizedTag === 'sale' || normalizedTag === 'for sale') {
      return 'For Sale';
    }
    return 'Trending';
  }

  private mapToProduct(doc: FirestoreProductDoc, index: number): TrendingProduct {
    const stockCount = Number(doc.stockCount ?? 0);
    const inStock = doc.inStock !== undefined ? Boolean(doc.inStock) : stockCount > 0;
    const colors =
      Array.isArray(doc.colors) && doc.colors.length > 0
        ? doc.colors
        : doc.color
          ? [doc.color]
          : ['Standard'];

    return {
      id: doc.id ?? `trending-${index}`,
      name: doc.title ?? 'Untitled Product',
      colors,
      color: doc.color ?? colors[0],
      size: doc.size !== undefined ? Number(doc.size) : undefined,
      unit: doc.unit,
      rating: Number(doc.rating ?? 0),
      price: Number(doc.price ?? 0),
      initialPrice:
        doc.initialPrice !== undefined ? Number(doc.initialPrice) : Number(doc.price ?? 0),
      isDiscounted: Boolean(doc.isDiscounted),
      stock: inStock ? Math.max(0, stockCount) : 0,
      image:
        doc.imageUrl ??
        '/attractive-young-middle-eastern-model-touching-her-pretty-face-with-flawless-skin-smiling.jpg',
      tag: this.resolveBadgeTag(doc),
      section: doc.section ?? 'TRENDING_NOW',
    };
  }

  private toPayload(product: TrendingProduct) {
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      initialPrice: product.initialPrice ?? product.price,
      isDiscounted: product.isDiscounted ?? product.tag === 'For Sale',
      image: product.image,
      rating: product.rating,
      inStock: product.stock > 0,
      stockCount: product.stock,
      section: product.section,
      color: product.color ?? product.colors[0],
      colors: product.colors,
      size: product.size,
      unit: product.unit,
    };
  }

  async toggleWishlist(product: TrendingProduct): Promise<void> {
    if (this.isBusy()) return;

    const uid = this.getActiveUid();
    if (!uid) {
      this.triggerToast('wishlist', 'Sign in to save to wishlist');
      return;
    }

    this.isUpdatingWishlist.set(true);
    try {
      const nowInWishlist = await this.wishlistService.toggleWishlist(
        uid,
        this.toPayload(product),
      );
      if (nowInWishlist) {
        this.triggerToast('wishlist', 'Item Added To Wishlist');
      }
    } catch (err) {
      console.error('[TrendingNow] Failed to toggle wishlist:', err);
    } finally {
      this.isUpdatingWishlist.set(false);
    }
  }

  async addToCart(product: TrendingProduct): Promise<void> {
    if (product.stock === 0 || this.isBusy()) return;

    const uid = this.getActiveUid();
    if (!uid) {
      this.triggerToast('cart', 'Sign in to add items to cart');
      return;
    }

    this.isAddingToCart.set(true);
    try {
      await this.cartService.addToCart(uid, this.toPayload(product), 1);
      this.addedToCart.emit(product);
      this.triggerToast('cart', 'Item Added To Cart');
    } catch (err) {
      console.error('[TrendingNow] Failed to add to cart:', err);
    } finally {
      this.isAddingToCart.set(false);
    }
  }

  filledStars(product: TrendingProduct): number {
    return Math.round(product.rating);
  }

  private triggerToast(type: 'wishlist' | 'cart', label: string): void {
    const id = ++this.toastIdCounter;
    this.toasts.update((current) => [...current, { id, type, label }]);
    setTimeout(() => {
      this.toasts.update((current) => current.filter((t) => t.id !== id));
    }, 1800);
  }
}