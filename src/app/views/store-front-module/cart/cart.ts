import { Component, signal } from '@angular/core';
import { CartItems } from '../../../components/store-front-module/cart-module/cart-items/cart-items';
import { OrderSummary } from '../../../components/store-front-module/cart-module/order-summary/order-summary';
import { AddCartItemModel } from '../../../models/store-front-module/cart/add-cart-item.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CartItems, OrderSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  host: { class: 'block w-full bg-white font-sans' },
})
export class Cart {
  cartItems = signal<AddCartItemModel[]>([]);

  onItemsChanged(items: AddCartItemModel[]): void {
    this.cartItems.set(items);
  }
}