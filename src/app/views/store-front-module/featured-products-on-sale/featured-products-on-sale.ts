import { Component, output } from '@angular/core';
import { FeaturedProductsOnSaleBanner } from '../../../components/store-front-module/featured-products-on-sale-module/featured-products-on-sale-banner/featured-products-on-sale-banner';
import {
  FeaturedProductsOnSaleListWidget,
  Product,
} from '../../../components/store-front-module/featured-products-on-sale-module/featured-products-on-sale-list-widget/featured-products-on-sale-list-widget';

@Component({
  selector: 'app-featured-products-on-sale',
  imports: [FeaturedProductsOnSaleBanner, FeaturedProductsOnSaleListWidget],
  templateUrl: './featured-products-on-sale.html',
  styleUrl: './featured-products-on-sale.css',
})
export class FeaturedProductsOnSale {
  addedToCart = output<Product>();
}