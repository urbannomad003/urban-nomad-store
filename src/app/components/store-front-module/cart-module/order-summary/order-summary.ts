import { Component, computed, inject, input } from '@angular/core';
import { AddCartItemModel } from '../../../../models/store-front-module/cart/add-cart-item.model';
import { CheckoutModel } from '../../../../models/store-front-module/cart/checkout.model';
import { CheckoutService } from '../../../../services/store-front-module/cart-module/checkout.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
  host: { class: 'block w-full font-sans' },
})
export class OrderSummary {
  private checkoutService = inject(CheckoutService);

  items = input<AddCartItemModel[]>([]);

  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0),
  );

  subtotal = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0),
  );

  private toCheckoutItems(): CheckoutModel[] {
    return this.items().map((item) => ({
      id: item.productId,
      title: item.name,
      price: item.price,
      quantity: item.quantity,
      section: item.section,
      color: item.color,
      size: item.size,
      unit: item.unit,
    }));
  }

  onWhatsAppCheckout(): void {
    this.checkoutService.checkoutViaWhatsApp(this.toCheckoutItems());
  }

  onEmailQuote(): void {
    this.checkoutService.generateQuoteEmail(this.toCheckoutItems());
  }
}