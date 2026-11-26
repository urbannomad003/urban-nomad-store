import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  orderBy,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, defer, map } from 'rxjs';

import { Product } from '../../../models/store-front-module/products/product.model';

@Injectable({
  providedIn: 'root',
})
export class StorefrontProductsService {
  private readonly firestore = inject(Firestore);
  private readonly envInjector = inject(EnvironmentInjector);

  getAllProducts(): Observable<Product[]> {
    return defer(() =>
      runInInjectionContext(this.envInjector, () => {
        const productsRef = collection(this.firestore, 'products');
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
      }),
    ).pipe(
      map((items) =>
        items.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          rating: Number(item.rating ?? 0),
          stockCount: Number(item.stockCount ?? 0),
          inStock: Boolean(item.inStock),
          isDiscounted: Boolean(item.isDiscounted),
        })),
      ),
    );
  }

  getProductsBySection(section: string): Observable<Product[]> {
    return defer(() =>
      runInInjectionContext(this.envInjector, () => {
        const productsRef = collection(this.firestore, 'products');
        const q = query(productsRef, where('section', '==', section));
        return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
      }),
    ).pipe(
      map((items) =>
        items.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          rating: Number(item.rating ?? 0),
          stockCount: Number(item.stockCount ?? 0),
          inStock: Boolean(item.inStock),
          isDiscounted: Boolean(item.isDiscounted),
        })),
      ),
    );
  }
}