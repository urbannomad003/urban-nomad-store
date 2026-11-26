import {
  Component,
  computed,
  effect,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  Output,
  runInInjectionContext,
  signal,
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

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'name-asc';

export type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';

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
  selector: 'app-trending-now-list-widget',
  templateUrl: './trending-now-list-widget.html',
  styleUrl: './trending-now-list-widget.css',
  host: { class: 'block font-sans' },
})
export class TrendingNowListWidget implements OnInit, OnDestroy {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly envInjector = inject(EnvironmentInjector);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cartService = inject(UploadCartItemsService);
  private readonly wishlistService = inject(UploadWishlistItemsService);

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

  isBusy = computed(() => this.isAddingToCart() || this.isUpdatingWishlist());

  // Filter & sort state
  searchQuery = signal('');
  availabilityFilter = signal<AvailabilityFilter>('all');
  sortBy = signal<SortOption>('default');
  isSortOpen = signal(false);

  stars = [1, 2, 3, 4, 5];

  sortOptions: { value: SortOption; label: string }[] = [
    { value: 'default', label: 'Trending' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'name-asc', label: 'Name: A to Z' },
  ];

  inStockCount = computed(() => this.products().filter((p) => p.stock > 0).length);

  outOfStockCount = computed(() => this.products().filter((p) => p.stock === 0).length);

  filteredAndSortedProducts = computed(() => {
    const term = this.searchQuery().trim().toLowerCase();
    const availability = this.availabilityFilter();
    const sort = this.sortBy();

    const filtered = this.products().filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.colors.some((c) => c.toLowerCase().includes(term));

      const matchesAvailability =
        availability === 'all' ||
        (availability === 'in-stock' && p.stock > 0) ||
        (availability === 'out-of-stock' && p.stock === 0);

      return matchesSearch && matchesAvailability;
    });

    const sorted = [...filtered];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return sorted;
  });

  hasActiveFilters = computed(
    () =>
      this.searchQuery().trim().length > 0 ||
      this.availabilityFilter() !== 'all' ||
      this.sortBy() !== 'default',
  );

  currentSortLabel = computed(
    () => this.sortOptions.find((o) => o.value === this.sortBy())?.label ?? 'Trending',
  );

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
          console.error('[TrendingNowListWidget] Wishlist stream error:', err);
        },
      });
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isSortOpen.set(false);
    }
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
          console.error('[TrendingNowListWidget] Firestore error:', err);
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

  selectSort(option: SortOption): void {
    this.sortBy.set(option);
    this.isSortOpen.set(false);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.availabilityFilter.set('all');
    this.sortBy.set('default');
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
      console.error('[TrendingNowListWidget] Failed to toggle wishlist:', err);
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
      console.error('[TrendingNowListWidget] Failed to add to cart:', err);
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